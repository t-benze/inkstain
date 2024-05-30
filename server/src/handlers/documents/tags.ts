import path from 'path';
import fs from 'fs/promises';
import {
  SpaceServiceError,
  ErrorCode as SpaceServiceErrorCode,
} from '~/server/services/SpaceService';
import logger from '~/server/logger'; // Make sure to import your configured logger
import { getFullPath } from '../../utils';
import { Context, MetaData } from '~/server/types';

/**
 * @swagger
 * /documents/{spaceKey}/tags:
 *   post:
 *     summary: Add tags to a document in a specific space
 *     tags: [Documents]
 *     operationId: addDocumentTags
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tags to add to the document
 *             required:
 *               - tags
 *     responses:
 *       200:
 *         description: Tags were successfully added to the document.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to process the tagging due to server error.
 */
export const addDocumentTags = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { tags } = ctx.request.body as { tags: string[] };
  const { path: documentPath } = ctx.request.query as { path: string };

  const documentDirectory = documentPath + '.ink';
  try {
    // Retrieve the full path for the document storage space
    const spaceRoot = await getFullPath(ctx.spaceService, spaceKey, '');
    const metaFilePath = path.join(spaceRoot, documentDirectory, 'meta.json');

    // Load existing metadata
    const fileMetaStr = await fs.readFile(metaFilePath, 'utf-8');
    const meta = JSON.parse(fileMetaStr);
    const existingTags = meta.tags ?? [];

    // Add new tags while avoiding duplicates
    const updatedTags = new Set([...existingTags, ...tags]);
    meta.tags = [...updatedTags];

    // Save updated metadata
    await fs.writeFile(metaFilePath, JSON.stringify(meta), 'utf-8');
    const space = await ctx.spaceService.getSpace(spaceKey);
    await ctx.documentService.indexDocument(space, documentPath);
    // Log successful operation
    logger.info(
      `Tags added to ${path.join(documentDirectory, 'meta.json')}: ${tags.join(
        ', '
      )}`
    );

    ctx.status = 200;
    ctx.body = 'Tags were successfully added to the document.';
  } catch (error) {
    if (
      error instanceof SpaceServiceError &&
      error.code === SpaceServiceErrorCode.SPACE_DOES_NOT_EXIST
    ) {
      ctx.status = 404;
      ctx.body = 'Space or document not found.';
    } else {
      logger.error(`Failed to add tags to document: ${error.message}`);
      ctx.status = 500;
      ctx.body = 'Unable to process the tagging due to server error.';
    }
  }
};

/**
 * @swagger
 * /documents/{spaceKey}/tags:
 *   delete:
 *     summary: Remove tags from a document in a specific space
 *     tags: [Documents]
 *     operationId: removeDocumentTags
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tags to remove from the document
 *             required:
 *               - tags
 *     responses:
 *       200:
 *         description: Tags were successfully removed from the document.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to process the tagging due to server error.
 */
export const removeDocumentTags = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { tags } = ctx.request.body as { tags: string[] };
  const { path: documentPath } = ctx.request.query as { path: string };

  const documentDirectory = documentPath + '.ink';
  try {
    const spaceRoot = await getFullPath(ctx.spaceService, spaceKey, '');
    const metaFilePath = path.join(spaceRoot, documentDirectory, 'meta.json');

    const fileMetaStr = await fs.readFile(metaFilePath, 'utf-8');
    const meta = JSON.parse(fileMetaStr) as MetaData;

    const existingTags = meta.tags ?? [];
    // Remove the specified tags
    meta.tags = existingTags.filter((tag) => !tags.includes(tag));

    await fs.writeFile(metaFilePath, JSON.stringify(meta), 'utf-8');
    const space = await ctx.spaceService.getSpace(spaceKey);
    await ctx.documentService.indexDocument(space, documentPath);

    logger.info(
      `Tags removed from ${path.join(
        documentDirectory,
        'meta.json'
      )}: ${tags.join(', ')}`
    );

    ctx.status = 200;
    ctx.body = 'Tags were successfully removed from the document.';
  } catch (error) {
    if (
      error instanceof SpaceServiceError &&
      error.code === SpaceServiceErrorCode.SPACE_DOES_NOT_EXIST
    ) {
      ctx.status = 404;
      ctx.body = 'Space or document not found.';
    } else {
      logger.error(`Failed to remove tags from document: ${error.message}`);
      ctx.status = 500;
      ctx.body = 'Unable to process the tagging due to server error.';
    }
  }
};

/**
 * @swagger
 * /documents/{spaceKey}/tags:
 *   get:
 *     summary: Retrieve tags of a document in a specific space
 *     tags: [Documents]
 *     operationId: getDocumentTags
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
 *         description: Retrieved tags of the document.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to retrieve the tags due to server error.
 */
export const getDocumentTags = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path;
  const documentDirectory = documentPath + '.ink';

  try {
    const spaceRoot = await getFullPath(ctx.spaceService, spaceKey, '');
    const metaFilePath = path.join(spaceRoot, documentDirectory, 'meta.json');
    const fileMetaStr = await fs.readFile(metaFilePath, 'utf-8');
    const meta = JSON.parse(fileMetaStr) as MetaData;
    ctx.status = 200;
    ctx.body = meta.tags ?? [];
  } catch (error) {
    if (
      error instanceof SpaceServiceError &&
      error.code === SpaceServiceErrorCode.SPACE_DOES_NOT_EXIST
    ) {
      ctx.status = 404;
      ctx.body = 'Space or document not found.';
    } else {
      logger.error(`Failed to retrieve tags from document: ${error.message}`);
      ctx.status = 500;
      ctx.body = 'Unable to retrieve the tags due to server error.';
    }
  }
};
