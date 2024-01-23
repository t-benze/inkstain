import Router from 'koa-router';
import spaceService from '../service/space';
import fs from 'fs/promises';
import path from 'path';

/**
 * @swagger
 * components:
 *   schemas:
 *     Space:
 *       type: object
 *       required:
 *         - name
 *         - path
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the space.
 *         path:
 *           type: string
 *           description: File system path to the space.
 *     Spaces:
 *       type: object
 *       description: An object where keys are space names and values contain space details.
 *       additionalProperties:
 *         $ref: '#/components/schemas/Space'
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
 *               $ref: '#/components/schemas/Spaces'
 *       500:
 *         description: Failed to get spaces.
 */
export const getSpaces = async (ctx: Router.RouterContext) => {
    try {
        ctx.body = await spaceService.getSpaces();
    } catch (error) {
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
 *             $ref: '#/components/schemas/Space'
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
    const { name, path: spacePath }: { name: string; path: string } = ctx.request.body;

    try {
        await spaceService.createSpace(name, spacePath);
        // Create the directory on the filesystem
        const fullPath = path.join(spaceService.getBasePath(), spacePath);
        await fs.mkdir(fullPath, { recursive: true });

        ctx.status = 201; // Space created successfully
    } catch (error) {
        if (error.message.includes('already exists')) {
            ctx.status = 400;
            ctx.body = error.message;
        } else {
            ctx.status = 500;
            ctx.body = 'Failed to create space';
        }
    }
};




/**
 * @swagger
 * /spaces/{name}:
 *   put:
 *     summary: Update an existing space
 *     tags: [Spaces]
 *     parameters:
 *       - in: path
 *         name: name
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
 *             required:
 *               - newName
 *             properties:
 *               newName:
 *                 type: string
 *                 description: New name for the space
 *     responses:
 *       200:
 *         description: Space updated successfully.
 *       400:
 *         description: Space does not exist or bad request.
 *       500:
 *         description: Failed to update space.
 */
export const updateSpace = async (ctx: Router.RouterContext) => {
  const { name } = ctx.params;
  const { newName }: { newName: string } = ctx.request.body;

  try {
    await spaceService.updateSpace(name, newName);
    ctx.status = 200;
    ctx.body = 'Space updated successfully';
  } catch (error) {
    ctx.status = error.message.includes('does not exist') ? 400 : 500;
    ctx.body = error.message;
  }
};

/**
 * @swagger
 * /spaces/{name}:
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
  const { name } = ctx.params;

  try {
    await spaceService.deleteSpace(name);
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
  router.put('/spaces/:name', updateSpace);
  router.delete('/spaces/:name', deleteSpace);
};
