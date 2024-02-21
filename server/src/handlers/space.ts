import Router from 'koa-router';
import spaceService, {
  SpaceServiceError,
  ErrorCode,
} from '~/server/services/spaceService';
import logger from '../logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     Space:
 *       type: object
 *       required:
 *         - path
 *         - name
 *         - key
 *       properties:
 *         path:
 *           type: string
 *           description: File system path to the space.
 *         name:
 *           type: string
 *           description: Name of the space.
 *         key:
 *           type: string
 *           description: Key of the space.
 */

/**
 * @swagger
 * /spaces:
 *   get:
 *     summary: Get all spaces
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
export const getSpaces = async (ctx: Router.RouterContext) => {
  try {
    const data = await spaceService.loadSpaceData();
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
 *     tags: [Spaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *               - name
 *             properties:
 *               path:
 *                 type: string
 *                 description: File system path to the space.
 *               name:
 *                 type: string
 *                 description: Name of the space.
 *     responses:
 *       201:
 *         description: Space created successfully.
 *       400:
 *         description: Space already exists or bad request.
 *       500:
 *         description: Failed to create space.
 */
export const createSpace = async (ctx: Router.RouterContext) => {
  // Extract details from the request body
  const data = ctx.request.body;
  try {
    await spaceService.createSpace(data);
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
export const updateSpace = async (ctx: Router.RouterContext) => {
  const { key } = ctx.params;
  const data = ctx.request.body;

  try {
    await spaceService.updateSpace(key, data);
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
 *     tags: [Spaces]
 *     parameters:
 *       - in: path
 *         name: name
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
export const deleteSpace = async (ctx: Router.RouterContext) => {
  const { key } = ctx.params;

  try {
    await spaceService.deleteSpace(key);
    ctx.status = 200;
    ctx.body = 'Space deleted successfully';
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
};
