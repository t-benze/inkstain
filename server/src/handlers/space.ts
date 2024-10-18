import Router from '@koa/router';
import { Context, Space } from '~/server/types';
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
  const data = await ctx.spaceService.loadSpaceData();
  ctx.status = 200;
  ctx.body = Object.keys(data)
    .sort()
    .map((key) => ({ ...data[key], key }));
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

  switch (type) {
    case 'new': {
      const space = await ctx.spaceService.createSpace(
        data as { name: string; path: string }
      );
      ctx.body = {
        space: space,
      };
      break;
    }
    case 'inkstain': {
      const path = (data as { path: string }).path;
      const taskId = ctx.taskService.addTask(async (progressCallback) => {
        const space = await ctx.spaceService.importExistingInkStainSpace(path);
        await ctx.documentService.indexSpace(space.key, progressCallback);
      });
      ctx.taskService.executeTask(taskId);
      ctx.body = { taskId };
      break;
    }
    default:
      throw new Error('Invalid space type in request');
  }
  ctx.status = 201; // Space created successfully
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
  const data = ctx.request.body as Partial<Space>;

  await ctx.spaceService.updateSpace(key, data);
  ctx.status = 200;
  ctx.body = 'Space updated successfully';
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

  await ctx.spaceService.deleteSpace(key);
  ctx.status = 200;
  ctx.body = 'Space deleted successfully';
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

  const tags = await ctx.documentService.getDocumentTags(key);
  ctx.status = 200;
  ctx.body = tags;
};

export const registerSpaceRoutes = (router: Router) => {
  router.get('/spaces', getSpaces);
  router.post('/spaces', createSpace);
  router.put('/spaces/:key', updateSpace);
  router.delete('/spaces/:key', deleteSpace);
  router.get('/spaces/:key/tags', getSpaceDocumentTags);
};
