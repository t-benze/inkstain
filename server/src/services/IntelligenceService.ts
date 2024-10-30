import path from 'path';
import fs from 'fs/promises';
import * as readline from 'readline';
import { createReadStream, createWriteStream } from 'fs';
import { EOL } from 'os';
import { DocumentTextDetectionData } from '~/server/types';
import { IntelligenceInterface } from '~/server/proxy/types';
import { PDFService } from './PDFService';
import { DocLayoutIndex, WebclipData } from '~/server/types';
import { SpaceService } from './SpaceService';
import { TaskService } from './TaskService';
import { ImageService } from './ImageService';
import { FileService } from './FileService';
// @ts-expect-error import type from p-limit
import type { LimitFunction } from 'p-limit';

export class IntelligenceService {
  private limit: Promise<LimitFunction>;
  constructor(
    private readonly spaceService: SpaceService,
    private readonly taskService: TaskService,
    private readonly pdfService: PDFService,
    private readonly fileService: FileService,
    private readonly imageService: ImageService,
    private intelligenceProxy: IntelligenceInterface
  ) {
    this.limit = import('p-limit').then((pLimit) => {
      return pLimit.default(1);
    });
  }

  setProxy(proxy: IntelligenceInterface) {
    this.intelligenceProxy = proxy;
  }
  // Read and write analyzed document cache to a jsonl file
  // The first line of the jsonl file is the index to map the page number to the line number
  // The rest of the lines are the analyzed layout data for each page
  public async readAnalyzedDocumentCache(
    spaceKey: string,
    documentPath: string,
    pageNum: string
  ): Promise<DocumentTextDetectionData | null> {
    const space = await this.spaceService.getSpace(spaceKey);
    if (space) {
      try {
        const cacheIndexFilePath = path.join(
          space.path,
          `${documentPath}.ink`,
          `analyzed-layout-index.json`
        );
        const cacheDataFilePath = path.join(
          space.path,
          `${documentPath}.ink`,
          `analyzed-layout.jsonl`
        );
        await fs.access(cacheIndexFilePath);
        const indexData = JSON.parse(
          await fs.readFile(cacheIndexFilePath, 'utf-8')
        ) as DocLayoutIndex;
        const dataLine = indexData.indexMap[pageNum];
        const fileStream = createReadStream(cacheDataFilePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        let lineNumber = 0;
        for await (const line of rl) {
          if (lineNumber === dataLine) {
            return JSON.parse(line) as DocumentTextDetectionData;
          }
          lineNumber++;
        }
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  public async writeAnalyzedDocumentCache(
    spaceKey: string,
    documentPath: string,
    totalPageNum: number,
    pageNum: string,
    data: object
  ) {
    const space = await this.spaceService.getSpace(spaceKey);
    if (space) {
      const cacheIndexFilePath = path.join(
        space.path,
        `${documentPath}.ink`,
        `analyzed-layout-index.json`
      );
      const cacheDataFilePath = path.join(
        space.path,
        `${documentPath}.ink`,
        `analyzed-layout.jsonl`
      );
      let cacheIndex;
      try {
        await fs.access(cacheIndexFilePath);
        cacheIndex = JSON.parse(
          await fs.readFile(cacheIndexFilePath, 'utf-8')
        ) as DocLayoutIndex;
      } catch (e) {
        cacheIndex = {
          status: 'partial',
          indexMap: {},
        } as DocLayoutIndex;
      }
      if (cacheIndex.indexMap[pageNum]) {
        return;
      }
      cacheIndex.indexMap[pageNum] = Object.keys(cacheIndex.indexMap).length;
      if (Object.keys(cacheIndex.indexMap).length === totalPageNum) {
        cacheIndex.status = 'completed';
      }
      await fs.writeFile(cacheIndexFilePath, JSON.stringify(cacheIndex));
      const writeStream = createWriteStream(cacheDataFilePath, { flags: 'a' });
      await new Promise<void>((resolve, reject) => {
        writeStream.write(JSON.stringify(data) + EOL, (error) => {
          if (error) {
            reject(error);
          } else {
            writeStream.end(() => {
              resolve();
            });
          }
        });
      });
    }
  }

  async analyzePDFDocument({
    spaceKey,
    documentPath,
  }: {
    spaceKey: string;
    documentPath: string;
  }) {
    const fileManager = await this.fileService.getFileManager(spaceKey);
    const taskId = this.taskService.addTask(async (progressCallback) => {
      const pdfPath = fileManager.getDocumentContentPath(documentPath);
      const doc = await this.pdfService.loadPDFFile(pdfPath);
      let indexData: DocLayoutIndex = {
        status: 'partial',
        indexMap: {},
      };
      try {
        const indexFile = await fileManager.readFile(
          documentPath,
          'analyzed-layout-index.json'
        );
        indexData = JSON.parse(indexFile) as DocLayoutIndex;
      } catch (e) {
        // do nothing
      }
      const pageCount = doc.numPages;
      const tasks: Promise<void>[] = [];
      const limit = await this.limit;
      let taskCompletedCount = 0;
      for (let i = 1; i <= pageCount; i++) {
        if (indexData.indexMap[i.toString()]) {
          continue;
        }
        tasks.push(
          limit(async () => {
            const imageDataUrl = await this.pdfService.renderPdfPageToImage(
              doc,
              i
            );
            const processedResponse = await this.intelligenceProxy.analyzeImage(
              imageDataUrl.split(',')[1]
            );
            await this.writeAnalyzedDocumentCache(
              spaceKey,
              documentPath,
              pageCount,
              i.toString(),
              processedResponse
            );
            taskCompletedCount++;
            progressCallback(taskCompletedCount / pageCount);
          })
        );
      }
      await Promise.all(tasks);
    });
    this.taskService.executeTask(taskId);
    return taskId;
  }

  async analyzeWebclipDocument({
    spaceKey,
    documentPath,
  }: {
    spaceKey: string;
    documentPath: string;
  }) {
    const fileManager = await this.fileService.getFileManager(spaceKey);
    const maxPixelCounts = 1400 * 1400;
    const taskId = this.taskService.addTask(async (progressCallback) => {
      const docContentPath = fileManager.getDocumentContentPath(documentPath);
      const content = await fs.readFile(docContentPath, 'utf-8');
      const webclipData = JSON.parse(content) as WebclipData;
      const imageDataUrl = webclipData.imageData;
      const dimension = webclipData.dimension;
      const slices = await this.imageService.sliceImage(
        imageDataUrl,
        dimension,
        maxPixelCounts
      );
      const layoutData = {
        blocks: [],
        lines: [],
      } as DocumentTextDetectionData;
      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i];
        const processedResponse = await this.intelligenceProxy.analyzeImage(
          slice.imageDataUrl.split(',')[1]
        );
        const processedBlocks =
          processedResponse.blocks?.map((block) => {
            return {
              ...block,
              width: (block.boundingBox.width * slice.width) / dimension.width,
              height:
                (block.boundingBox.height * slice.height) / dimension.height,
              left: (block.boundingBox.left * slice.width) / dimension.width,
              top: (block.boundingBox.top * slice.height) / dimension.height,
            };
          }) || [];
        const processedLines =
          processedResponse.lines?.map((line) => {
            return {
              ...line,
              width: (line.boundingBox.width * slice.width) / dimension.width,
              height:
                (line.boundingBox.height * slice.height) / dimension.height,
              left: (line.boundingBox.left * slice.width) / dimension.width,
              top: (line.boundingBox.top * slice.height) / dimension.height,
            };
          }) || [];
        layoutData.blocks = [...(layoutData.blocks ?? []), ...processedBlocks];
        layoutData.lines = [...(layoutData.lines ?? []), ...processedLines];
        progressCallback(i / slices.length);
      }
      await this.writeAnalyzedDocumentCache(
        spaceKey,
        documentPath,
        1,
        '1',
        layoutData
      );
    });
    this.taskService.executeTask(taskId);
    return taskId;
  }

  async getDocLayoutStatus({
    spaceKey,
    documentPath,
  }: {
    spaceKey: string;
    documentPath: string;
  }) {
    const fileManager = await this.fileService.getFileManager(spaceKey);
    try {
      const fileContent = await fileManager.readFile(
        documentPath,
        'analyzed-layout-index.json'
      );
      const indexMap = JSON.parse(fileContent) as DocLayoutIndex;
      return indexMap.status || null;
    } catch (error) {
      return null;
    }
  }
}
