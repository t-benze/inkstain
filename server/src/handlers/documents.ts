import Router from 'koa-router';
import send from 'koa-send';
import path from 'path';
import fs from 'fs/promises';
import spaceService from '~/server/services/spaceService';
import logger from '~/server/logger'; // Make sure to import your configured logger

// Helper function to get the full file path
const getFullPath = async (
  spaceName: string,
  filePath: string
): Promise<string> => {
  const spaces = await spaceService.getSpaces();
  const space = spaces[spaceName];

  if (!space) {
    throw new Error(`The space '${spaceName}' does not exist.`);
  }

  const resolvedPath = path.resolve(space.path, filePath);
  if (!resolvedPath.startsWith(space.path)) {
    throw new Error('Invalid file path. Possible directory traversal attempt.');
  }
  return resolvedPath;
};

/**
 * @swagger
 * /documents/{spaceName}/list/{path}:
 *   get:
 *     summary: List all documents within a space or sub-folder
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: spaceName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           The relative path within the space, or '~' for root.
 *           The path should be URL-encoded.
 *     responses:
 *       200:
 *         description: A list of documents and sub-folders within the space or sub-folder.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or sub-folder not found.
 */
const listDocuments = async (ctx: Router.RouterContext) => {
  const spaceName = ctx.params.spaceName;
  let filePath = ctx.params.path;

  if (filePath === '~') {
    filePath = ''; // Translate '~' to an empty string to signify the root directory
  }

  try {
    const fullPath = await getFullPath(spaceName, filePath);
    const files = await fs.readdir(fullPath, { withFileTypes: true });
    ctx.body = files.map((file) => ({
      name: file.name,
      type: file.isDirectory() ? 'folder' : 'file',
      path: path.join(fullPath, file.name),
    }));
    ctx.status = 200;
    logger.info(
      `Listed documents in space '${spaceName}' at path '${filePath || '/'}'`
    );
  } catch (error) {
    ctx.status = error.message.includes('does not exist') ? 404 : 400;
    ctx.body = { message: error.message };
    logger.error(
      `Failed to list documents in space '${spaceName}': ${error.message}`
    );
  }
};

/**
 * @swagger
 * /documents/{spaceName}/content/{path}:
 *   get:
 *     summary: Serve document content from a space
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: spaceName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The relative path to the document within the space
 *     responses:
 *       200:
 *         description: The content of the document.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 */
const getDocumentContent = async (ctx: Router.RouterContext) => {
  const { spaceName, path: filePath } = ctx.params;
  try {
    const fullPath = await getFullPath(spaceName, filePath);
    await send(ctx, fullPath);
    // Log the successful operation
    logger.info(
      `Served document content from space '${spaceName}' and path '${filePath}'`
    );
  } catch (error) {
    ctx.status = error.message.includes('does not exist') ? 404 : 400;
    ctx.body = error.message;
    // Log the error
    logger.error(
      `Failed to serve document content from space '${spaceName}': ${error.message}`
    );
  }
};

// Register routes and export
export const registerDocumentRoutes = (router: Router) => {
  router.get('/documents/:spaceName/list/:path*', listDocuments);
  router.get('/documents/:spaceName/content/:path*', getDocumentContent);
};
