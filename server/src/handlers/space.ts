import Router from '@koa/router';
import { SpaceServiceError, ErrorCode } from '~/server/services/SpaceService';
import logger from '../logger';
import { RequestParamsError } from './common';
import { Context } from '~/server/types';
import { DefinedError } from 'ajv';
import { traverseDirectory } from '~/server/utils';

/**
 * @swagger
 * /spaces:
 *   get:
 *     summary: Get all spaces
 *     operationId: getSpaces
 *     tags: [Spaces]
 *     responses:
 *       200:
 *         description: List of all spaces.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Space'
 *       500:
 *         description: Failed to get spaces.
 */
export const getSpaces = async (ctx: Context) => {
  try {
    const data = await ctx.spaceService.loadSpaceData();
    ctx.body = Object.keys(data)
      .sort()
      .map((key) => ({ ...data[key], key }));
  } catch (error) {
    logger.error(error);
    ctx.status = 500;
    ctx.body = 'Failed to get spaces';
  }
};

/**
 * @swagger
 * /spaces:
 *   post:
 *     summary: Create a new space
 *     operationId: createSpace
 *     tags: [Spaces]
 *     parameters:
 *      - in: query
 *        name: type
 *        required: false
 *        schema:
 *          $ref: '#/components/schemas/CreateSpaceOperationType'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSpaceRequest'
 *     responses:
 *       201:
 *         description: Space created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 taskId:
 *                   type: string
 *                   description: Task ID for the space creation process. When presents, the space is being created in the background and the task ID can be used to track the progress.
 *
 *       400:
 *         description: Space already exists or bad request.
 *       500:
 *         description: Failed to create space.
 */
export const createSpace = async (ctx: Context) => {
  // Extract details from the request body
  const type = ctx.query.type || 'new';
  const data = ctx.request.body;
  const validate = ctx.validator.getSchema('CreateSpaceRequest');
  if (!validate(data)) {
    const definedErrors: DefinedError[] =
      validate.errors?.map((error) => error as DefinedError) || [];
    throw new RequestParamsError('Create space params error', definedErrors);
  }

  try {
    switch (type) {
      case 'new': {
        await ctx.spaceService.createSpace(
          data as { name: string; path: string }
        );
        break;
      }
      case 'inkstain': {
        const path = (data as { path: string }).path;
        const taskId = ctx.taskService.addTask(async (progressCallback) => {
          const space = await ctx.spaceService.importExistingInkStainSpace(
            path
          );
          await ctx.documentService.clearIndex(space);
          const documentsToIndex = [];
          await traverseDirectory(path, path, documentsToIndex);
          const totalDocuments = documentsToIndex.length;
          for (const [index, doc] of documentsToIndex.entries()) {
            await ctx.documentService.indexDocument(space, doc);
            if (index % 10 === 0) {
              progressCallback((index / totalDocuments) * 100);
            }
          }
        });
        ctx.taskService.executeTask(taskId);
        ctx.body = { taskId };
        break;
      }
      default:
        throw new Error('Invalid space type');
    }
    ctx.status = 201; // Space created successfully
  } catch (error) {
    logger.error(error.message);
    if (error instanceof SpaceServiceError) {
      if (error.code === ErrorCode.SPACE_ALREADY_EXISTS) {
        ctx.status = 400;
        ctx.body = error.message;
        return;
      }
    }
    throw error;
  }
};

/**
 * @swagger
 * /spaces/{key}:
 *   put:
 *     summary: Update an existing space
 *     operationId: updateSpace
 *     tags: [Spaces]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               path:
 *                 type: string
 *                 description: File system path to the space.
 *               name:
 *                 type: string
 *                 description: Name of the space.
 *     responses:
 *       200:
 *         description: Space updated successfully.
 *       400:
 *         description: Space does not exist or bad request.
 *       500:
 *         description: Failed to update space.
 */
export const updateSpace = async (ctx: Context) => {
  const { key } = ctx.params;
  const data = ctx.request.body;

  try {
    await ctx.spaceService.updateSpace(key, data);
    ctx.status = 200;
    ctx.body = 'Space updated successfully';
  } catch (error) {
    ctx.status = error.message.includes('does not exist') ? 400 : 500;
    ctx.body = error.message;
  }
};

/**
 * @swagger
 * /spaces/{key}:
 *   delete:
 *     summary: Delete an existing space
 *     operationId: deleteSpace
 *     tags: [Spaces]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space to delete
 *     responses:
 *       200:
 *         description: Space deleted successfully.
 *       400:
 *         description: Space does not exist or bad request.
 *       500:
 *         description: Failed to delete space.
 */
export const deleteSpace = async (ctx: Context) => {
  const { key } = ctx.params;

  try {
    await ctx.spaceService.deleteSpace(key);
    ctx.status = 200;
    ctx.body = 'Space deleted successfully';
  } catch (error) {
    ctx.status = error.message.includes('does not exist') ? 400 : 500;
    ctx.body = error.message;
  }
};

/**
 * @swagger
 * /spaces/{key}/tags:
 *   get:
 *     summary: Get all document tags of a space
 *     operationId: getSpaceDocumentTags
 *     tags: [Spaces]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space to get document tags from
 *     responses:
 *       200:
 *         description: Document tags retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DocumentTag'
 *       400:
 *         description: Space does not exist or bad request.
 *       500:
 *         description: Failed to retrieve document tags.
 */
export const getSpaceDocumentTags = async (ctx: Context) => {
  const { key } = ctx.params;

  try {
    const tags = await ctx.documentService.getDocumentTags(key);
    ctx.status = 200;
    ctx.body = tags;
  } catch (error) {
    ctx.status = error.message.includes('does not exist') ? 400 : 500;
    ctx.body = error.message;
  }
};

export const registerSpaceRoutes = (router: Router) => {
  router.get('/spaces', getSpaces);
  router.post('/spaces', createSpace);
  router.put('/spaces/:key', updateSpace);
  router.delete('/spaces/:key', deleteSpace);
  router.get('/spaces/:key/tags', getSpaceDocumentTags);
};
