import Router from '@koa/router';
import { Context, CommonHTTPErrorData } from '~/server/types';
import { IntelligenceAnalyzeDocumentRequest } from '@inkstain/client-api';
import { AuthError, DocIntelligenceError } from '~/server/proxy/types';

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
 *     requestBody:
 *       description: A base64 encoded image file
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentPath:
 *                 type: string
 *                 description: The relative path to the document within the space
 *             required:
 *               - documentPath
 *     responses:
 *       200:
 *         description: Analyzed document successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                   description: The task id
 *               required:
 *                 - taskId
 *       401:
 *         description: Invalid parameters provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseData'
 *       403:
 *         description: Invalid parameters provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseData'
 *       500:
 *         description: Unable to analyze the document due to server error.
 */
export const analyzePDFDocument = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { documentPath } = ctx.request
    .body as IntelligenceAnalyzeDocumentRequest;
  try {
    const taskId = await ctx.intelligenceService.analyzePDFDocument({
      spaceKey,
      documentPath,
    });
    ctx.status = 200;
    ctx.body = { taskId };
  } catch (e) {
    if (e instanceof AuthError) {
      ctx.throw(401, e.message, new CommonHTTPErrorData(e.code));
    } else if (e instanceof DocIntelligenceError) {
      ctx.throw(403, e.message, new CommonHTTPErrorData(e.code));
    } else {
      throw e;
    }
  }
};

/**
 * @swagger
 * /intelligence/{spaceKey}/webclip:
 *   post:
 *     summary: analyze webclip doucment through intelligence service
 *     tags: [Intelligence]
 *     operationId: intelligenceWebclipDocument
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *     requestBody:
 *       description: A base64 encoded image file
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentPath:
 *                 type: string
 *                 description: The relative path to the document within the space
 *             required:
 *               - documentPath
 *     responses:
 *       200:
 *         description: Analyzed document successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                   description: The task id
 *               required:
 *                 - taskId
 *       401:
 *         description: Invalid parameters provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseData'
 *       403:
 *         description: Invalid parameters provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponseData'
 *       500:
 *         description: Unable to analyze the document due to server error.
 */
export const analyzeWebclipDocument = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { documentPath } = ctx.request
    .body as IntelligenceAnalyzeDocumentRequest;
  try {
    const taskId = await ctx.intelligenceService.analyzeWebclipDocument({
      spaceKey,
      documentPath,
    });
    ctx.status = 200;
    ctx.body = { taskId };
  } catch (e) {
    if (e instanceof AuthError) {
      ctx.throw(401, e.message, new CommonHTTPErrorData(e.code));
    } else if (e instanceof DocIntelligenceError) {
      ctx.throw(403, e.message, new CommonHTTPErrorData(e.code));
    } else {
      throw e;
    }
  }
};

/**
 * @swagger
 * /intelligence/{spaceKey}/layout:
 *   get:
 *     summary: get the document layout of a specified document page
 *     tags: [Intelligence]
 *     operationId: intelligenceDocLayout
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
 *     responses:
 *       200:
 *         description: Analyzed document successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DocumentTextDetectionData'
 *       400:
 *         description: Invalid parameters provided.
 *       500:
 *         description: Unable to analyze the document due to server error.
 */
const getDocumentLayout = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { path: documentPath, pageNum } = ctx.query as {
    path: string;
    pageNum: string;
  };

  if (!spaceKey || !documentPath || !pageNum) {
    ctx.throw(400, 'Missing required parameters');
  }

  const result = await ctx.intelligenceService.readAnalyzedDocumentLayout(
    spaceKey,
    documentPath,
    pageNum
  );

  ctx.status = 200;
  ctx.body = {
    data: result,
  };
};

/**
 * @swagger
 * /intelligence/{spaceKey}/layout-status:
 *   get:
 *     summary: get the document layout status of a specified document
 *     tags: [Intelligence]
 *     operationId: intelligenceDocLayoutStatus
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
 *     responses:
 *       200:
 *         description: The status of the document layout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum:
 *                     - completed
 *                     - partial
 *                   description: The status of the document layout
 */
const docLayoutStatus = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { path: documentPath } = ctx.query as {
    path: string;
    pageNum: string;
  };
  const status = await ctx.intelligenceService.getDocLayoutStatus({
    spaceKey,
    documentPath,
  });
  ctx.status = 200;
  ctx.body = { status };
};

/**
 * @swagger
 * /intelligence/{spaceKey}/text-content:
 *   get:
 *     summary: Get the text content of a document
 *     tags: [Intelligence]
 *     operationId: intelligenceDocTextContent
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
 *     responses:
 *       200:
 *         description: The text content of the document
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentTextContent'
 *       400:
 *         description: Invalid parameters provided.
 *       500:
 *         description: Unable to retrieve the text content due to server error.
 */
const getDocumentTextContent = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { path: documentPath } = ctx.query as {
    path: string;
  };
  const result = await ctx.intelligenceService.getDocTextContent({
    spaceKey,
    documentPath,
  });
  ctx.status = 200;
  ctx.body = result;
};

export const registerIntelligenceRoutes = (router: Router) => {
  router.post('/intelligence/:spaceKey/analyze', analyzePDFDocument);
  router.post('/intelligence/:spaceKey/webclip', analyzeWebclipDocument);
  router.get('/intelligence/:spaceKey/layout-status', docLayoutStatus);
  router.get('/intelligence/:spaceKey/layout', getDocumentLayout);
  router.get('/intelligence/:spaceKey/text-content', getDocumentTextContent);
};
