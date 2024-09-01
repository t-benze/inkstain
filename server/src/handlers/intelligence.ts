import Router from '@koa/router';
import { Context } from '~/server/types';
import { guardAuthenticated } from '~/server/middlewares/guardAuthenticated';

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
 *               $ref: '#/components/schemas/DocumentTextDetectionData'
 *       400:
 *         description: Invalid parameters provided.
 *       500:
 *         description: Unable to analyze the document due to server error.
 */
export const analyzeDocument = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { path: documentPath, pageNum } = ctx.query as {
    path: string;
    pageNum: string;
  };
  const file = ctx.request.body as string;

  try {
    const result = await ctx.intelligenceService.analyzeDocument({
      file,
      spaceKey,
      documentPath,
      pageNum,
    });
    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.throw(500, e.message);
  }
};

export const registerIntelligenceRoutes = (router: Router) => {
  router.post(
    '/intelligence/:spaceKey/analyze',
    guardAuthenticated,
    analyzeDocument
  );
};
