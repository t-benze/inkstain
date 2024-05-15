import Router from 'koa-router';
import send from 'koa-send';
import path from 'path';
import fs from 'fs/promises';
import multer from '@koa/multer';
import spaceService, {
  SpaceServiceError,
  ErrorCode as SpaceServiceErrorCode,
} from '~/server/services/spaceService';
import logger from '~/server/logger'; // Make sure to import your configured logger
import type { File } from 'koa-multer';
import {
  TextractClient,
  AnalyzeDocumentCommand,
  DetectDocumentTextCommand,
} from '@aws-sdk/client-textract'; // ES Modules import
import { fromIni } from '@aws-sdk/credential-providers';
const REGION = 'ap-southeast-1'; //e.g. "us-east-1"
const profileName = 'AdministratorAccess-408793953592';

async function loadMockResponse() {
  const mockData = path.resolve(
    __dirname,
    '../../../../assets/mocks/sample-pdf-analyze-layout-result.json'
  );
  return await fs.readFile(mockData, 'utf8');
}

const client = new TextractClient({
  region: REGION,
  credentials: fromIni({ profile: profileName }),
});

/**
 * @swagger
 * /documents/{spaceKey}/analyze:
 *   post:
 *     summary: analyze doucment through intelligence service
 *     tags: [Documents]
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
  const { path: documentPath, pageNum, mock = false } = ctx.query;
  const file = ctx.request.body as string;

  // const command = new DetectDocumentTextCommand({
  //   Document: {
  //     Bytes: new Uint8Array(Buffer.from(file, 'base64')),
  //   },
  // });
  const command = new AnalyzeDocumentCommand({
    Document: {
      Bytes: new Uint8Array(Buffer.from(file, 'base64')),
    },
    FeatureTypes: ['LAYOUT'],
  });
  try {
    const response =
      mock === '1' ? await loadMockResponse() : await client.send(command);
    ctx.status = 200;
    ctx.body = response;
    console.log('analyze document', spaceKey, documentPath, pageNum);
  } catch (e) {
    console.error(e);
  }
};
