import { SpaceService } from './SpaceService';
import { TaskService } from './TaskService';
import { ImageService } from './ImageService';
import path from 'path';
import fs from 'fs/promises';
import * as readline from 'readline';
import { createReadStream, createWriteStream } from 'fs';
import { EOL } from 'os';
import { IntelligenceProxy, DocumentTextDetectionData } from '~/server/types';
import { getDocumentPath } from '~/server/utils';
import { PDFService } from './PDFService';
import { DocLayoutIndex, WebclipData } from '~/server/types';
import { kMaxLength } from 'buffer';

export class IntelligenceService {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly taskService: TaskService,
    private readonly pdfService: PDFService,
    private readonly imageService: ImageService,
    private readonly intelligenceProxy: IntelligenceProxy
  ) {}
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
        };
      }
      cacheIndex.indexMap[pageNum] = Object.keys(cacheIndex.indexMap).length;
      if (Object.keys(cacheIndex.indexMap).length === totalPageNum) {
        cacheIndex.status = 'completed';
      }
      await fs.writeFile(cacheIndexFilePath, JSON.stringify(cacheIndex));
      const writeStream = createWriteStream(cacheDataFilePath, { flags: 'a' });
      writeStream.write(JSON.stringify(data) + EOL);
      writeStream.end();
    }
  }

  async analyzePDFDocument({
    spaceKey,
    documentPath,
  }: {
    spaceKey: string;
    documentPath: string;
  }) {
    const space = await this.spaceService.getSpace(spaceKey);
    const taskId = this.taskService.addTask(async (progressCallback) => {
      const pdfPath = await getDocumentPath(space, documentPath);
      const doc = await this.pdfService.loadPDFFile(
        path.join(pdfPath, 'content.pdf')
      );
      let indexData: DocLayoutIndex = {
        status: 'partial',
        indexMap: {},
      };
      try {
        const indexFile = await fs.readFile(
          path.join(pdfPath, 'analyzed-layout-index.json'),
          'utf-8'
        );
        indexData = JSON.parse(indexFile) as DocLayoutIndex;
      } catch (e) {
        // do nothing
      }
      const pageCount = doc.numPages;
      for (let i = 1; i <= pageCount; i++) {
        if (indexData.indexMap[i.toString()]) {
          continue;
        }
        const imageDataUrl = await this.pdfService.renderPdfPageToImage(doc, i);
        const processedResponse = await this.intelligenceProxy.analyzeDocument(
          imageDataUrl.split(',')[1]
        );
        await this.writeAnalyzedDocumentCache(
          spaceKey,
          documentPath,
          pageCount,
          i.toString(),
          processedResponse
        );
        progressCallback(i / pageCount);
      }
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
    const space = await this.spaceService.getSpace(spaceKey);
    const maxPixelCounts = 1400 * 1400;
    const taskId = this.taskService.addTask(async (progressCallback) => {
      const docPath = await getDocumentPath(space, documentPath);
      const content = await fs.readFile(
        path.join(docPath, 'content.inkclip'),
        'utf-8'
      );
      const webclipData = JSON.parse(content) as WebclipData;
      const imageDataUrl = webclipData.imageData;
      const dimension = webclipData.dimension;
      const slices = await this.imageService.sliceImage(
        imageDataUrl,
        dimension,
        maxPixelCounts
      );
      const layoutData: DocumentTextDetectionData = {
        blocks: [],
        lines: [],
      };
      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i];
        const processedResponse = await this.intelligenceProxy.analyzeDocument(
          slice.imageDataUrl.split(',')[1]
        );
        const processedBlocks = processedResponse.blocks?.map((block) => {
          return {
            ...block,
            width: (block.boundingBox.width * slice.width) / dimension.width,
            height:
              (block.boundingBox.height * slice.height) / dimension.height,
            left: (block.boundingBox.left * slice.width) / dimension.width,
            top: (block.boundingBox.top * slice.height) / dimension.height,
          };
        });
        const processedLines = processedResponse.lines?.map((line) => {
          return {
            ...line,
            width: (line.boundingBox.width * slice.width) / dimension.width,
            height: (line.boundingBox.height * slice.height) / dimension.height,
            left: (line.boundingBox.left * slice.width) / dimension.width,
            top: (line.boundingBox.top * slice.height) / dimension.height,
          };
        });
        layoutData.blocks = layoutData.blocks.concat(processedBlocks);
        layoutData.lines = layoutData.lines.concat(processedLines);
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
    const space = await this.spaceService.getSpace(spaceKey);
    const fileContent = await fs.readFile(
      path.join(
        getDocumentPath(space, documentPath),
        'analyzed-layout-index.json'
      )
    );
    const indexMap = JSON.parse(fileContent.toString()) as DocLayoutIndex;
    return indexMap.status || null;
  }
}
