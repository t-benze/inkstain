import Router from '@koa/router';
import path from 'path';
import fs from 'fs/promises';
import {
  TextractClient,
  AnalyzeDocumentCommand,
} from '@aws-sdk/client-textract'; // ES Modules import
import { fromIni } from '@aws-sdk/credential-providers';
const REGION = 'ap-southeast-1'; //e.g. "us-east-1"
const profileName = 'AdministratorAccess-408793953592';
import * as readline from 'readline';
import { createReadStream, createWriteStream } from 'fs';
import { EOL } from 'os';
import { Space } from '~/server/services/SpaceService';

async function loadMockResponse() {
  const mockData = path.resolve(
    __dirname,
    '../../../assets/mocks/sample-pdf-analyze-layout-result.json'
  );
  return await fs.readFile(mockData, 'utf8');
}

const client = new TextractClient({
  region: REGION,
  credentials: fromIni({ profile: profileName }),
});

// Read and write analyzed document cache to a jsonl file
// The first line of the jsonl file is the index to map the page number to the line number
// The rest of the lines are the analyzed layout data for each page
async function readAnalyzedDocumentCache(
  space: Space,
  documentPath: string,
  pageNum: string
) {
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
          return JSON.parse(line);
        }
        lineNumber++;
      }
    } catch (err) {
      return null;
    }
  }
  return null;
}

async function writeAnalyzedDocumentCache(
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

/**
 * @swagger
 * /intelligence/{spaceKey}/analyze:
 *   post:
 *     summary: analyze doucment through intelligence service
 *     tags: [Intelligence]
 *     operationId: intelligenceAnalyzeDocument
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The relative path to the document within the space
 *       - in: query
 *         name: pageNum
 *         required: true
 *         schema:
 *           type: number
 *         description: The page number to analyze
 *       - in: query
 *         name: mock
 *         required: false
 *         schema:
 *           type: number
 *         description: 1 to use mock data, 0 to use real data
 *     requestBody:
 *       description: A base64 encoded image file
 *       required: true
 *       content:
 *         text/plain:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Analyzed document successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentTextDetection'
 *       400:
 *         description: Invalid parameters provided.
 *       500:
 *         description: Unable to analyze the document due to server error.
 */
export const analyzeDocument = async (ctx: Router.RouterContext) => {
  const { spaceKey } = ctx.params;
  const {
    path: documentPath,
    pageNum,
    mock = false,
  } = ctx.query as { path: string; pageNum: string; mock: string };
  const file = ctx.request.body as string;
  const space = await ctx.spaceService.getSpace(spaceKey);

  try {
    let result = await readAnalyzedDocumentCache(space, documentPath, pageNum);
    if (!result) {
      const command = new AnalyzeDocumentCommand({
        Document: {
          Bytes: new Uint8Array(Buffer.from(file, 'base64')),
        },
        FeatureTypes: ['LAYOUT'],
      });
      result =
        mock === '1' ? await loadMockResponse() : await client.send(command);
      writeAnalyzedDocumentCache(space, documentPath, pageNum, result);
    }
    ctx.status = 200;
    ctx.body = result;
    console.log('analyze document', spaceKey, documentPath, pageNum);
  } catch (e) {
    console.error(e);
  }
};

export const registerIntelligenceRoutes = (router: Router) => {
  router.post('/intelligence/:spaceKey/analyze', analyzeDocument);
};
