import Router from 'koa-router';
import send from 'koa-send';
import path from 'path';
import fs from 'fs/promises';
import multer from '@koa/multer';
import spaceService from '~/server/services/spaceService';
import logger from '~/server/logger'; // Make sure to import your configured logger
import type { File } from 'koa-multer';

const upload = multer({
  storage: multer.memoryStorage(),
});
// Helper function to get the full file path
const getFullPath = async (
  spaceName: string,
  filePath: string
): Promise<string> => {
  if (filePath === '~') {
    filePath = ''; // Translate '~' to an empty string to signify the root directory
  }
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
 * /documents/{spaceName}/list:
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
 *       - in: query
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the file or folder.
 *                   type:
 *                     type: string
 *                     enum: [file, folder]
 *                     description: The type of the item (file or folder).
 *                   path:
 *                     type: string
 *                     description: The full path of the file or folder.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or sub-folder not found.
 */
const listDocuments = async (ctx: Router.RouterContext) => {
  const spaceName = ctx.params.spaceName;
  let filePath = ctx.query.path;

  try {
    const fullPath = await getFullPath(spaceName, filePath);
    const files = await fs.readdir(fullPath);
    const results = files
      .filter((file) => file !== '.inkstain')
      .map(async (file) => {
        // const stat = await fs.stat(path.join(fullPath, file, 'content'));
        let isFile = false;
        try {
          await fs.stat(path.join(fullPath, file, 'content'));
          isFile = true;
        } catch (e) {
          isFile = false;
        }
        return {
          name: file,
          type: isFile ? 'file' : 'folder',
          path: path.join(fullPath, file),
        };
      });
    ctx.status = 200;
    ctx.body = await Promise.all(results);
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
 * /documents/{spaceName}/content:
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
 *       - in: query
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
  const { spaceName } = ctx.params;
  const filePath = ctx.query.path;
  try {
    const spaceRoot = await getFullPath(spaceName, '~');
    const fileMetaStr = await fs.readFile(
      path.join(spaceRoot, filePath, 'meta.json'),
      'utf-8'
    );
    const meta = JSON.parse(fileMetaStr);
    // const fullPath = await getFullPath(spaceName, filePath);
    ctx.response.type = meta.mimetype;
    await send(ctx, path.join(filePath, 'content'), { root: spaceRoot });
    // Log the successful operation
    logger.info(
      `Served document content from ${path.join(filePath, 'content')}`
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

/**
 * @swagger
 * /documents/{spaceName}/add:
 *   post:
 *     summary: Add a new document to a space
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: spaceName
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *             required:
 *               - document
 *     responses:
 *       201:
 *         description: Document added successfully.
 *       400:
 *         description: Invalid parameters or unable to process the file.
 *       500:
 *         description: Internal server error while adding the document.
 */
const addDocument = async (ctx: Router.RouterContext) => {
  const file = ctx.request.file as File; // assuming file is uploaded through a form and handled by middleware
  const targetPath = ctx.request.query.path;
  const spaceName = ctx.request.params.spaceName;

  if (!file || !targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing file or target path';
    return;
  }

  try {
    // const ext = path.extname(file.originalname);
    // const filename = path.basename(file.originalname, ext);
    const targetDirectoryPath = await getFullPath(
      spaceName,
      path.join(targetPath)
    );
    // Create target directory
    await fs.mkdir(targetDirectoryPath, { recursive: true });

    // Write file content
    const contentPath = path.join(targetDirectoryPath, 'content');
    await fs.writeFile(contentPath, file.buffer);

    // Write metadata json
    const metadata = {
      mimetype: file.mimetype,
      // Add other metadata if available
    };
    const metadataPath = path.join(targetDirectoryPath, 'meta.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    ctx.status = 201;
    ctx.body = {
      message: 'Document added successfully',
      path: targetDirectoryPath,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: error.message };
    logger.error(`Failed to add document: ${error.message}`);
  }
};

/**
 * @swagger
 * /documents/{spaceName}/delete:
 *   delete:
 *     summary: Delete a document from a space
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: spaceName
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
 *         description: Document deleted successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 */
const deleteDocument = async (ctx: Router.RouterContext) => {
  const spaceName = ctx.request.params.spaceName;
  const targetPath = ctx.request.query.path;

  if (!targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing target path';
    return;
  }

  try {
    const targetDirectoryPath = await getFullPath(
      spaceName,
      path.join(targetPath)
    );

    await fs.rm(targetDirectoryPath, { recursive: true, force: true });
    ctx.status = 200;
    ctx.body = 'Document deleted successfully';
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: error.message };
    logger.error(`Failed to delete document: ${error.message}`);
  }
};

/**
 * @swagger
 * /documents/{spaceName}/addFolder:
 *   post:
 *     summary: Add a new folder within a space
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: spaceName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The relative path within the space where the folder should be created
 *     responses:
 *       200:
 *         description: Folder created successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space not found.
 */
const addFolder = async (ctx: Router.RouterContext) => {
  const spaceName = ctx.request.params.spaceName;
  const targetPath = ctx.request.query.path;

  if (!targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing target path';
    return;
  }

  try {
    const targetDirectoryPath = await getFullPath(
      spaceName,
      path.join(targetPath)
    );

    await fs.mkdir(targetDirectoryPath, { recursive: true });
    ctx.status = 200;
    ctx.body = 'Folder created successfully';
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: error.message };
    logger.error(`Failed to create folder: ${error.message}`);
  }
};

// Register routes and export
export const registerDocumentRoutes = (router: Router) => {
  router.get('/documents/:spaceName/list', listDocuments);
  router.get('/documents/:spaceName/content', getDocumentContent);
  router.post(
    '/documents/:spaceName/add',
    upload.single('document'),
    addDocument
  );
  router.post('/documents/:spaceName/addFolder', addFolder);
  router.delete('/documents/:spaceName/delete', deleteDocument);
};
