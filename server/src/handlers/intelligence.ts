import Router from '@koa/router';
import { Context } from '~/server/types';
import { guardAuthenticated } from '~/server/middlewares/guardAuthenticated';
import { IntelligenceAnalyzeDocumentRequest } from '@inkstain/client-api';

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
 *       400:
 *         description: Invalid parameters provided.
 *       500:
 *         description: Unable to analyze the document due to server error.
 */
export const analyzePDFDocument = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { documentPath } = ctx.request
    .body as IntelligenceAnalyzeDocumentRequest;
  const taskId = await ctx.intelligenceService.analyzePDFDocument({
    spaceKey,
    documentPath,
  });
  ctx.status = 200;
  ctx.body = { taskId };
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
 *       400:
 *         description: Invalid parameters provided.
 *       500:
 *         description: Unable to analyze the document due to server error.
 */
export const analyzeWebclipDocument = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { documentPath } = ctx.request
    .body as IntelligenceAnalyzeDocumentRequest;
  const taskId = await ctx.intelligenceService.analyzeWebclipDocument({
    spaceKey,
    documentPath,
  });
  ctx.status = 200;
  ctx.body = { taskId };
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

  const result = await ctx.intelligenceService.readAnalyzedDocumentCache(
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

export const registerIntelligenceRoutes = (router: Router) => {
  router.post(
    '/intelligence/:spaceKey/analyze',
    guardAuthenticated,
    analyzePDFDocument
  );
  router.post(
    '/intelligence/:spaceKey/webclip',
    guardAuthenticated,
    analyzeWebclipDocument
  );
  router.get('/intelligence/:spaceKey/layout-status', docLayoutStatus);
  router.get('/intelligence/:spaceKey/layout', getDocumentLayout);
};
