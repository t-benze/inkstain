import {
  SpaceServiceError,
  ErrorCode as SpaceServiceErrorCode,
} from '~/server/services/SpaceService';
import path from 'path';
import fs from 'fs/promises';
import logger from '~/server/logger'; // Make sure to import your configured logger
import { Context, MetaData } from '~/server/types';
import { getDocumentPath } from '~/server/utils';

const handleErrors = (ctx, error) => {
  if (
    error instanceof SpaceServiceError &&
    error.code === SpaceServiceErrorCode.SPACE_DOES_NOT_EXIST
  ) {
    ctx.status = 404;
    ctx.body = 'Space or document not found.';
  } else {
    logger.error(`Failed to process the attributes: ${error.message}`);
    ctx.status = 500;
    ctx.body = 'Unable to process the attributes due to server error.';
  }
};

/**
 * @swagger
 * /documents/{spaceKey}/attributes:
 *   get:
 *     summary: Retrieve attributes of a document in a specific space
 *     tags: [Documents]
 *     operationId: getDocumentAttributes
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
 *         description: Retrieved attributes of the document.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Object containing all attributes associated with the document.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to retrieve the attributes due to server error.
 */
export const getDocumentAttributes = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path as string;

  try {
    const space = await ctx.spaceService.getSpace(spaceKey);
    const metaFilePath = path.join(
      getDocumentPath(space, documentPath),
      'meta.json'
    );

    const fileMetaStr = await fs.readFile(metaFilePath, 'utf-8');
    const meta = JSON.parse(fileMetaStr) as MetaData;

    ctx.status = 200;
    ctx.body = meta.attributes ?? {};
  } catch (error) {
    handleErrors(ctx, error);
  }
};

/**
 * @swagger
 * /documents/{spaceKey}/attributes:
 *   post:
 *     summary: Add or update attributes of a document in a specific space
 *     tags: [Documents]
 *     operationId: addUpdateDocumentAttributes
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
 *       description: JSON object containing attributes to add or update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attributes:
 *                 type: object
 *                 description: Attributes to add or update.
 *     responses:
 *       200:
 *         description: Attributes added or updated successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to add or update the attributes due to server error.
 */
export const addUpdateDocumentAttributes = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path as string;

  try {
    const space = await ctx.spaceService.getSpace(spaceKey);
    const metaFilePath = path.join(
      getDocumentPath(space, documentPath),
      'meta.json'
    );

    const fileMetaStr = await fs.readFile(metaFilePath, 'utf-8');
    const meta = JSON.parse(fileMetaStr) as MetaData;

    const updates = (ctx.request.body as { attributes: object }).attributes;
    meta.attributes = { ...meta.attributes, ...updates };

    await fs.writeFile(metaFilePath, JSON.stringify(meta), 'utf-8');
    await ctx.documentService.indexDocument(spaceKey, documentPath);

    ctx.status = 200;
    ctx.body = 'Attributes added or updated successfully.';
  } catch (error) {
    handleErrors(ctx, error);
  }
};

/**
 * @swagger
 * /documents/{spaceKey}/attributes:
 *   delete:
 *     summary: Delete attributes from a document in a specific space
 *     tags: [Documents]
 *     operationId: deleteDocumentAttributes
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
 *       description: JSON array containing keys of attributes to delete
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *     responses:
 *       200:
 *         description: Attributes deleted successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to delete the attributes due to server error.
 */
export const deleteDocumentAttributes = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path as string;

  try {
    const space = await ctx.spaceService.getSpace(spaceKey);
    const metaFilePath = path.join(
      getDocumentPath(space, documentPath),
      'meta.json'
    );

    const fileMetaStr = await fs.readFile(metaFilePath, 'utf-8');
    const meta = JSON.parse(fileMetaStr) as MetaData;

    const deletions = ctx.request.body as string[];
    deletions.forEach((key) => {
      delete meta.attributes[key];
    });

    await fs.writeFile(metaFilePath, JSON.stringify(meta), 'utf-8');
    await ctx.documentService.indexDocument(spaceKey, documentPath);
    ctx.status = 200;
    ctx.body = 'Attributes deleted successfully.';
  } catch (error) {
    handleErrors(ctx, error);
  }
};
