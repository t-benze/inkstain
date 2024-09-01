import { SpaceService, Space } from './SpaceService';
import path from 'path';
import fs from 'fs/promises';
import * as readline from 'readline';
import { createReadStream, createWriteStream } from 'fs';
import { EOL } from 'os';
import {
  IntelligenceProxy,
  DocumentTextDetectionDataInner,
} from '~/server/types';

export class IntelligenceService {
  constructor(
    private readonly spaceService: SpaceService,
    private readonly intelligenceProxy: IntelligenceProxy
  ) {}
  // Read and write analyzed document cache to a jsonl file
  // The first line of the jsonl file is the index to map the page number to the line number
  // The rest of the lines are the analyzed layout data for each page
  private async readAnalyzedDocumentCache(
    space: Space,
    documentPath: string,
    pageNum: string
  ): Promise<DocumentTextDetectionDataInner[] | null> {
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
        const indexMap = JSON.parse(
          await fs.readFile(cacheIndexFilePath, 'utf-8')
        );
        const dataLine = indexMap[pageNum];
        const fileStream = createReadStream(cacheDataFilePath);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });

        let lineNumber = 0;
        for await (const line of rl) {
          if (lineNumber === dataLine) {
            return JSON.parse(line) as DocumentTextDetectionDataInner[];
          }
          lineNumber++;
        }
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  private async writeAnalyzedDocumentCache(
    space: Space,
    documentPath: string,
    pageNum: string,
    data: object
  ) {
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
        cacheIndex = JSON.parse(await fs.readFile(cacheIndexFilePath, 'utf-8'));
      } catch (e) {
        cacheIndex = {};
      }
      cacheIndex[pageNum] = Object.keys(cacheIndex).length;
      await fs.writeFile(cacheIndexFilePath, JSON.stringify(cacheIndex));
      const writeStream = createWriteStream(cacheDataFilePath, { flags: 'a' });
      writeStream.write(JSON.stringify(data) + EOL);
      writeStream.end();
    }
  }

  public async loadMockResponse() {
    const mockData = path.resolve(
      __dirname,
      '../../../assets/mocks/sample-pdf-analyze-layout-result.json'
    );
    return await fs.readFile(mockData, 'utf8');
  }

  async analyzeDocument({
    file,
    spaceKey,
    documentPath,
    pageNum,
  }: {
    file: string;
    spaceKey: string;
    documentPath: string;
    pageNum: string;
  }) {
    const space = await this.spaceService.getSpace(spaceKey);
    const cache = await this.readAnalyzedDocumentCache(
      space,
      documentPath,
      pageNum
    );
    if (cache) return cache;
    const processedResponse = await this.intelligenceProxy.analyzeDocument(
      file
    );
    await this.writeAnalyzedDocumentCache(
      space,
      documentPath,
      pageNum,
      processedResponse
    );
    return processedResponse;
  }
}
