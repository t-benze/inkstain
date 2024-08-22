import path from 'path';
import fs from 'fs/promises';
import Router from '@koa/router';
import logger from '~/server/logger'; // Make sure to import your configured logger
import {
  SpaceServiceError,
  ErrorCode as SpaceServiceErrorCode,
} from '~/server/services/SpaceService';
import { Context } from '~/server/types';
import { getFullPath } from '~/server/utils';

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

  try {
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

    const result = await Promise.all(
      documents.map(async (doc) => {
        const filePath = await getFullPath(
          ctx.spaceService,
          spaceKey,
          doc.documentPath
        );
        const metaFile = path.join(filePath + '.ink', 'meta.json');
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
  } catch (error) {
    if (
      error instanceof SpaceServiceError &&
      error.code === SpaceServiceErrorCode.SPACE_DOES_NOT_EXIST
    ) {
      ctx.status = 404;
      ctx.body = 'Space not found.';
    } else {
      logger.error(`Failed to search documents: ${error.message}`);
      ctx.status = 500;
      ctx.body = 'Unable to process the search due to server error.';
    }
  }
};

export const registerSearchRoutes = (router: Router) => {
  router.get('/search/:spaceKey/documents', searchDocuments);
};
