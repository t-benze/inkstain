import Router from 'koa-router';
import send from 'koa-send';
import path from 'path';
import fs from 'fs/promises';
import logger from '~/server/logger'; // Import the logger

const staticRoot = path.join(__dirname, '../public');

const listDirectoryContents = async (dirRelPath: string): Promise<any[]> => {
  const fullDirPath = path.join(staticRoot, dirRelPath);
  try {
    const files = await fs.readdir(fullDirPath, { withFileTypes: true });
    return files.map((file) => ({
      name: file.name,
      type: file.isDirectory() ? 'folder' : 'file',
      path: path.join(dirRelPath, file.name),
    }));
  } catch (err) {
    throw new Error('Directory not found or inaccessible.');
  }
};

/**
 * @swagger
 * /documents/list/{path}:
 *   get:
 *     summary: Lists documents and folders.
 *     description: Recursively lists all documents and sub-folders within the specified path.
 *     parameters:
 *       - in: path
 *         name: path
 *         required: false
 *         description: URL-encoded relative path to a sub-folder from the root.
 *         schema:
 *           type: string
 *           default: ''
 *     responses:
 *       200:
 *         description: A list of documents and sub-folders.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [folder, file]
 *                   path:
 *                     type: string
 *       400:
 *         description: Invalid directory path provided.
 *       404:
 *         description: Directory not found or inaccessible.
 */
const listDocuments = async (ctx: Router.RouterContext) => {
  const urlPath = ctx.params[0] || '';
  const dirRelPath = path.normalize(decodeURIComponent(urlPath));

  if (dirRelPath.includes('..')) {
    logger.warn(`Attempted directory traversal: ${dirRelPath}`);
    ctx.throw(400, 'Invalid directory path.');
    return;
  }

  try {
    ctx.body = await listDirectoryContents(dirRelPath);
    logger.info(`Listed documents at path: ${dirRelPath}`);
    ctx.status = 200;
  } catch (err) {
    logger.error(`Error listing documents: ${err.message}`);
    ctx.throw(404, err.message);
  }
};

/**
 * @swagger
 * /documents/content/{path}:
 *   get:
 *     summary: Serve a document.
 *     description: Serve the binary content of the document located at the given path.
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         description: URL-encoded relative path to the document from the root.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Binary content of the document.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid file path provided.
 *       404:
 *         description: Document not found.
 */
const getDocumentContent = async (ctx: Router.RouterContext) => {
  const urlPath = ctx.params[0] || '';
  const filePath = path.normalize(decodeURIComponent(urlPath));

  if (filePath.includes('..')) {
    logger.warn(`Attempted file access outside of root directory: ${filePath}`);
    ctx.throw(400, 'Invalid file path.');
    return;
  }

  const fullPath = path.join(staticRoot, filePath);

  try {
    await send(ctx, fullPath, { root: staticRoot });
    logger.info(`Served document content from path: ${filePath}`);
  } catch (err) {
    logger.error(`Error serving document content: ${err.message}`);
    ctx.throw(404, 'Document not found.');
  }
};

export const documentRoutes = (router: Router) => {
  router.get('/documents/list/(.*)', listDocuments);
  router.get('/documents/content/(.*)', getDocumentContent);
};
