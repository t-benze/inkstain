import path from 'path';
import fs from 'fs/promises';
import Router from '@koa/router';
import { Context } from '~/server/types';
import { getDocumentPath } from '~/server/utils';

/**
 * @swagger
 * /search/{spaceKey}/documents:
 *   get:
 *     summary: Search documents in a specific space
 *     tags: [Search]
 *     operationId: searchDocuments
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *       - in: query
 *         name: tagFilter
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: The tag to filter documents by
 *       - in: query
 *         name: attributeFilters
 *         schema:
 *           type: string
 *           description: a json object with key value pairs to filter documents by, encoded as a string
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: The number of documents to skip
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of documents to return
 *     responses:
 *       200:
 *         description: Documents were successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentSearchResult'
 *               required:
 *                 - data
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space not found.
 *       500:
 *         description: Unable to process the search due to server error.
 */
export const searchDocuments = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { tagFilter, attributeFilters, offset, limit } = ctx.request.query as {
    tagFilter?: string[] | string;
    attributeFilters?: string;
    offset?: string;
    limit?: string;
  };
  const attributeFiltersObj = attributeFilters
    ? JSON.parse(attributeFilters)
    : undefined;

  const documents = await ctx.documentService.searchDocuments(spaceKey, {
    tagFilter: tagFilter
      ? Array.isArray(tagFilter)
        ? tagFilter
        : [tagFilter]
      : undefined,
    attributeFilters: attributeFiltersObj,
    offset: offset ? parseInt(offset) : undefined,
    limit: limit ? parseInt(limit) : undefined,
  });

  const space = await ctx.spaceService.getSpace(spaceKey);
  const result = await Promise.all(
    documents.map(async (doc) => {
      const filePath = await getDocumentPath(space, doc.documentPath);
      const metaFile = path.join(filePath, 'meta.json');
      const meta = JSON.parse(await fs.readFile(metaFile, 'utf-8'));
      return {
        documentPath: doc.documentPath,
        meta,
      };
    })
  );

  ctx.status = 200;
  ctx.body = {
    data: result,
  };
};

/**
 * @swagger
 * /search/{spaceKey}/overview:
 *   get:
 *     summary: Get overview of a space
 *     tags: [Search]
 *     operationId: getSpaceOverview
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *     responses:
 *       200:
 *         description: Overview was successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     documentCount:
 *                       type: integer
 *                     tagCount:
 *                       type: integer
 *                     attributeCount:
 *                       type: integer
 *               required:
 *                 - data
 *       404:
 *         description: Space not found.
 *       500:
 *         description: Unable to retrieve the overview due to server error.
 */
export const documentsOverview = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const overview = await ctx.documentService.getOverView(spaceKey);
  ctx.status = 200;
  ctx.body = {
    data: overview,
  };
};

/**
 * @swagger
 * /search/{spaceKey}/reindex:
 *   post:
 *     summary: Reindex a space
 *     tags: [Search]
 *     operationId: reindexSpace
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *     responses:
 *       200:
 *         description: Reindexing was successfully started.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                   description: The ID of the task
 *               required:
 *                 - taskId
 *       404:
 *         description: Space not found.
 *       500:
 *         description: Unable to start the reindexing due to server error.
 */
export const reindexSpace = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const taskId = ctx.taskService.addTask(async (progressCallback) => {
    await ctx.documentService.indexSpace(spaceKey, progressCallback);
  });
  ctx.taskService.executeTask(taskId);
  ctx.status = 200;
  ctx.body = {
    taskId,
  };
};

export const registerSearchRoutes = (router: Router) => {
  router.get('/search/:spaceKey/documents', searchDocuments);
  router.get('/search/:spaceKey/overview', documentsOverview);
  router.post('/search/:spaceKey/reindex', reindexSpace);
};
