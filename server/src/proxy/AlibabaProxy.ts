import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { DocumentTextDetectionData } from '~/server/types';
import { DocIntelligenceInterface } from './types';
import Client, {
  SubmitDocStructureJobAdvanceRequest,
  GetDocStructureResultRequest,
} from '@alicloud/docmind-api20220711';
import { $OpenApiUtil } from '@alicloud/openapi-core';
import * as Utils from '@alicloud/tea-util';
import { FileService } from '~/server/services/FileService';
import { SecretService } from '~/server/services/SecretService';
import { directories } from '~/server/settings';

type DocInfo = {
  pages: Array<{
    imageWidth: number;
    imageHeight: number;
  }>;
};
type Layout = {
  text: string;
  type: string;
  uniqueId: string;
  pageNum: Array<number>;
  pos: Array<{ x: number; y: number }>;
  blocks: Array<{
    pos: Array<{ x: number; y: number }>;
    text: string;
  }>;
};
type ProcessResult = {
  docInfo: DocInfo;
  layouts: Array<Layout>;
};

const cacheDir = path.join(directories.cacheDir, 'alibaba-layouts');
if (!existsSync(cacheDir)) {
  mkdirSync(cacheDir, { recursive: true });
}

// only extract text from the layout types in the whitelist
const LAYOUT_WHITELIST = [
  'head',
  'title',
  'multicolumn',
  'foot',
  'corner_note',
  'text',
  'end_note',
  'side',
];
export class AlibabaProxy implements DocIntelligenceInterface {
  private client: Client | null = null;
  constructor(
    private readonly fileService: FileService,
    private readonly secretService: SecretService
  ) {}

  public async initClient(keyId: string) {
    const secret = await this.secretService.getSecret(keyId);
    if (!secret) {
      throw new Error('Secret not found');
    }
    this.client = new Client(
      new $OpenApiUtil.Config({
        endpoint: 'docmind-api.cn-hangzhou.aliyuncs.com',
        accessKeyId: keyId,
        accessKeySecret: secret,
        type: 'access_key',
      })
    );
  }

  private processLayoutData(data: {
    docInfo: DocInfo;
    layouts: Array<Layout>;
  }): Array<DocumentTextDetectionData> {
    const layoutData: Array<DocumentTextDetectionData> = [];
    const pageInfo = data.docInfo.pages;
    data.layouts.forEach((layout) => {
      if (!LAYOUT_WHITELIST.includes(layout.type)) {
        return;
      }
      layout.pageNum.forEach((pageNum) => {
        let pageData = layoutData[pageNum];
        if (!pageData) {
          pageData = {
            blocks: [],
            lines: [],
          };
          layoutData[pageNum] = pageData;
        }
        const page = pageInfo[pageNum];
        const layoutId = layout.uniqueId;
        const lines = layout.blocks
          ? layout.blocks.map((block, index) => {
              return {
                id: `${layoutId}-${index}`,
                text: block.text,
                boundingBox: {
                  width: (block.pos[1].x - block.pos[0].x) / page.imageWidth,
                  height: (block.pos[2].y - block.pos[0].y) / page.imageHeight,
                  left: block.pos[0].x / page.imageWidth,
                  top: block.pos[0].y / page.imageHeight,
                },
              };
            })
          : [];

        pageData.blocks.push({
          type: layout.type,
          text: layout.text,
          id: layout.uniqueId,
          childrenIds: lines.map((line) => line.id),
          boundingBox: {
            width: (layout.pos[1].x - layout.pos[0].x) / page.imageWidth,
            height: (layout.pos[2].y - layout.pos[0].y) / page.imageHeight,
            left: layout.pos[0].x / page.imageWidth,
            top: layout.pos[0].y / page.imageHeight,
          },
        });
        pageData.lines.push(...lines);
      });
    });
    return layoutData;
  }

  async analyzeDocLayout(dataStream: Readable, fileName: string) {
    if (!this.client) {
      throw new Error('AlibabaCloud Client not initialized');
    }
    const hash = crypto.createHash('md5').update(fileName).digest('hex');
    const cacheFilePath = path.join(cacheDir, `${hash}.json`);
    let processResponse: ProcessResult | null = null;
    if (existsSync(cacheFilePath)) {
      processResponse = JSON.parse(
        await fs.readFile(cacheFilePath, 'utf-8')
      ) as ProcessResult;
    } else {
      const advanceRequest = new SubmitDocStructureJobAdvanceRequest();
      advanceRequest.fileUrlObject = dataStream;
      advanceRequest.fileName = path.basename(fileName);
      advanceRequest.structureType = 'layout';
      const runtimeObject = new Utils.RuntimeOptions({});
      const response = await this.client.submitDocStructureJobAdvance(
        advanceRequest,
        runtimeObject
      );
      if (!response.body?.data) {
        throw new Error(
          'Failed at submitting job, response body: ' + response.body?.message
        );
      }
      const jobId = response.body.data.id;
      const resultRequest = new GetDocStructureResultRequest({
        id: jobId,
      });
      while (!processResponse) {
        const resultResponse = await this.client.getDocStructureResult(
          resultRequest
        );
        const completed = resultResponse.body?.completed ?? false;
        if (!completed) {
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } else {
          const status = resultResponse.body?.status;
          if (status === 'Success') {
            const data = resultResponse.body?.data as ProcessResult | undefined;
            if (data) {
              await fs.writeFile(cacheFilePath, JSON.stringify(data));
              processResponse = data;
            }
          } else {
            throw new Error(
              'Job failed with status: ' +
                status +
                '.' +
                'Code: ' +
                resultResponse.body?.code +
                '. Message: ' +
                resultResponse.body?.message
            );
          }
        }
      }
    }
    if (!processResponse) {
      throw new Error('Error processing Document');
    }
    return this.processLayoutData(processResponse);
  }

  // for PNG image only.
  async analyzeImage(
    imageData: string,
    fileName: string,
    progressCallback?: (progress: number) => void
  ) {
    const imageBuffer = Buffer.from(imageData, 'base64');
    const readableStream = Readable.from([imageBuffer]);
    const layoutData = await this.analyzeDocLayout(readableStream, fileName);
    return layoutData.length > 0 ? layoutData[0] : null;
  }

  async analyzePDF(
    pdfPath: string,
    progressCallback?: (progress: number) => void
  ) {
    const readableStream = createReadStream(pdfPath);
    return await this.analyzeDocLayout(readableStream, pdfPath);
  }
}
