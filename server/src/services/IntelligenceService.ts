import path from 'path';
import fs from 'fs/promises';
import * as readline from 'readline';
import { createWriteStream } from 'fs';
import { EOL } from 'os';
import { DocumentTextContent } from '@inkstain/client-api';
import { extractWebclipData } from '@inkstain/webclip';
import { DocumentTextDetectionData } from '~/server/types';
import {
  DocIntelligenceError,
  DocIntelligenceInterface,
} from '~/server/proxy/types';
import { SpaceService } from './SpaceService';
import { TaskService, TaskError } from './TaskService';
import { ImageService } from './ImageService';
import { FileService } from './FileService';

export class IntelligenceService {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly taskService: TaskService,
    private readonly fileService: FileService,
    private readonly imageService: ImageService,
    private intelligenceProxy: DocIntelligenceInterface
  ) {}

  setProxy(proxy: DocIntelligenceInterface) {
    this.intelligenceProxy = proxy;
  }
  // Read and write analyzed document cache to a jsonl file
  // The first line of the jsonl file is the index to map the page number to the line number
  // The rest of the lines are the analyzed layout data for each page
  public async readAnalyzedDocumentLayout(
    spaceKey: string,
    documentPath: string,
    pageNum: string
  ): Promise<DocumentTextDetectionData | null> {
    const space = await this.spaceService.getSpace(spaceKey);
    const fileManager = await this.fileService.getFileManager(spaceKey);
    if (space) {
      try {
        const fileStream = fileManager.createReadStream(
          documentPath,
          `analyzed-layout.jsonl`
        );
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });
        const targetLine = parseInt(pageNum, 10) - 1;

        let lineNumber = 0;
        for await (const line of rl) {
          if (lineNumber === targetLine) {
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

  async writeTextContentData(
    spaceKey: string,
    documentPath: string,
    textContentData: {
      textContent: string[];
      textBlockToOffset: Record<string, number>;
    }
  ) {
    const space = await this.spaceService.getSpace(spaceKey);
    if (space) {
      const filePath = path.join(
        space.path,
        `${documentPath}.ink`,
        `text-content.json`
      );
      await fs.writeFile(filePath, JSON.stringify(textContentData));
    }
  }

  public async writeAnalyzedDocumentLayout(
    spaceKey: string,
    documentPath: string,
    layoutData: Array<DocumentTextDetectionData>
  ) {
    const space = await this.spaceService.getSpace(spaceKey);
    if (space) {
      const cacheDataFilePath = path.join(
        space.path,
        `${documentPath}.ink`,
        `analyzed-layout.jsonl`
      );
      const writeStream = createWriteStream(cacheDataFilePath, { flags: 'w' });
      for (const data of layoutData) {
        await new Promise<void>((resolve, reject) => {
          writeStream.write(JSON.stringify(data) + EOL, (error) => {
            if (!error) {
              resolve();
            } else {
              reject(error);
            }
          });
        });
      }
    }
  }

  private extractTextContentFromLayoutData(
    layoutData: Array<DocumentTextDetectionData>
  ) {
    const textContent = [] as string[];
    const textBlockToOffset = {} as Record<string, number>;
    for (const data of layoutData) {
      for (const textBlock of data.blocks) {
        textBlockToOffset[textBlock.id] = textContent.length;
        textContent.push(textBlock.text.replace(/<br>/g, ' '));
      }
    }
    return {
      textContent,
      textBlockToOffset,
    };
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
      try {
        const pdfPath = fileManager.getDocumentContentPath(documentPath);
        const layoutData = await this.intelligenceProxy.analyzePDF(
          pdfPath,
          progressCallback
        );
        const textContentData =
          this.extractTextContentFromLayoutData(layoutData);
        await this.writeTextContentData(
          spaceKey,
          documentPath,
          textContentData
        );
        await this.writeAnalyzedDocumentLayout(
          spaceKey,
          documentPath,
          layoutData
        );
      } catch (e) {
        if (e instanceof DocIntelligenceError) {
          throw new TaskError(e.message, e.code);
        }
        if (e instanceof Error) {
          throw new TaskError(e.message + '\n' + e.stack);
        } else {
          throw new TaskError('Unknown error');
        }
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
    const fileManager = await this.fileService.getFileManager(spaceKey);
    const taskId = this.taskService.addTask(async (progressCallback) => {
      try {
        const docContentPath = fileManager.getDocumentContentPath(documentPath);
        const content = await fs.readFile(docContentPath);
        const arrayBuffer = content.buffer.slice(
          content.byteOffset,
          content.byteOffset + content.byteLength
        );
        const { slices } = extractWebclipData(arrayBuffer);
        const layoutData = [] as Array<DocumentTextDetectionData>;
        for (let i = 0; i < slices.length; i++) {
          const slice = slices[i];
          const processedResponse = await this.intelligenceProxy.analyzeImage(
            slice.imageDataUrl.split(',')[1],
            `${documentPath}-slice-${i}.png`
          );
          if (processedResponse) {
            layoutData.push(processedResponse);
          }
          progressCallback(i / slices.length);
        }
        const textContentData =
          this.extractTextContentFromLayoutData(layoutData);
        await this.writeTextContentData(
          spaceKey,
          documentPath,
          textContentData
        );
        await this.writeAnalyzedDocumentLayout(
          spaceKey,
          documentPath,
          layoutData
        );
      } catch (error) {
        if (error instanceof Error) {
          if (error instanceof DocIntelligenceError) {
            throw new TaskError(error.message, error.code);
          }
          throw new TaskError(error.message + '\n' + error.stack);
        } else {
          throw new TaskError('Unknown error');
        }
      }
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
    const exists = await fileManager.fileExists(
      documentPath,
      'analyzed-layout.jsonl'
    );
    return exists ? 'completed' : null;
  }

  async getDocTextContent({
    spaceKey,
    documentPath,
  }: {
    spaceKey: string;
    documentPath: string;
  }) {
    const fileManager = await this.fileService.getFileManager(spaceKey);
    const fileContent = await fileManager.readFile(
      documentPath,
      'text-content.json'
    );
    return JSON.parse(fileContent) as DocumentTextContent;
  }
}
