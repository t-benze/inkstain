import Router from 'koa-router';
import send from 'koa-send';
import path from 'path';
import fs from 'fs/promises';
import multer from '@koa/multer';
import spaceService, {
  SpaceServiceError,
  ErrorCode as SpaceServiceErrorCode,
} from '~/server/services/spaceService';
import logger from '~/server/logger'; // Make sure to import your configured logger
import type { File } from 'koa-multer';

const upload = multer({
  storage: multer.memoryStorage(),
});
// Helper function to get the full file path
const getFullPath = async (
  spaceKey: string,
  filePath: string
): Promise<string> => {
  const spaces = await spaceService.loadSpaceData();
  const space = spaces[spaceKey];

  if (!space) {
    logger.info('spaces data' + JSON.stringify(spaces));
    throw new Error(`The space '${spaceKey}' does not exist.`);
  }

  const resolvedPath = path.resolve(space.path, filePath);
  const relative = path.relative(space.path, resolvedPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Invalid file path. Possible directory traversal attempt.');
  }

  return resolvedPath;
};

/**
 * @swagger
 * /documents/{spaceKey}/list:
 *   get:
 *     summary: List all documents within a space or sub-folder
 *     tags: [Documents]
 *     operationId: listDocuments
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The key of the space
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: |
 *           The relative path within the space.
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
 *                   absolutePath:
 *                     type: string
 *                     description: The absolute path of the file or folder.
 *                 required:
 *                   - name
 *                   - type
 *                   - path
 *                   - absolutePath
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or sub-folder not found.
 */
const listDocuments = async (ctx: Router.RouterContext) => {
  const spaceKey = ctx.params.spaceKey;
  const filePath = ctx.query.path;

  try {
    const fullPath = await getFullPath(spaceKey, filePath);
    const files = await fs.readdir(fullPath);
    const results = files
      .filter((file) => file !== '.inkstain')
      .map(async (file) => {
        const isFile = file.endsWith('.ink');
        file = file.replace('.ink', '');
        return {
          name: file,
          type: isFile ? 'file' : 'folder',
          path: path.join(filePath, file),
          absolutePath: path.join(fullPath, file),
        };
      });
    ctx.status = 200;
    ctx.body = await Promise.all(results);
    logger.info(
      `Listed documents in space '${spaceKey}' at path '${filePath || '/'}'`
    );
  } catch (error) {
    if (error instanceof SpaceServiceError) {
      if (error.code === SpaceServiceErrorCode.SPACE_DOES_NOT_EXIST) {
        ctx.status = 404;
        ctx.body = error.message;
        return;
      }
    }
    throw error;
  }
};

/**
 * @swagger
 * /documents/{spaceKey}/content:
 *   get:
 *     summary: Serve document content from a space
 *     tags: [Documents]
 *     operationId: getDocumentContent
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
 *         description: The content of the document.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 */
const getDocumentContent = async (ctx: Router.RouterContext) => {
  const { spaceKey } = ctx.params;
  const filePath = ctx.query.path + '.ink';
  try {
    const spaceRoot = await getFullPath(spaceKey, '');
    const fileMetaStr = await fs.readFile(
      path.join(spaceRoot, filePath, 'meta.json'),
      'utf-8'
    );
    const extension = path.extname(ctx.query.path);
    const meta = JSON.parse(fileMetaStr);
    ctx.response.type = meta.mimetype;
    await send(ctx, path.join(filePath, `content${extension}`), {
      root: spaceRoot,
    });
    // Log the successful operation
    logger.info(
      `Served document content from ${path.join(filePath, 'content')}`
    );
  } catch (error) {
    if (error instanceof SpaceServiceError) {
      if (error.code === SpaceServiceErrorCode.SPACE_DOES_NOT_EXIST) {
        ctx.status = 404;
        ctx.body = error.message;
        return;
      }
    }
    logger.error(error.message);
    throw error;
  }
};

/**
 * @swagger
 * /documents/{spaceKey}/add:
 *   post:
 *     summary: Add a new document to a space
 *     tags: [Documents]
 *     operationId: addDocument
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
  const spaceKey = ctx.request.params.spaceKey;

  if (!file || !targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing file or target path';
    return;
  }

  try {
    const ext = path.extname(file.originalname);
    // const filename = path.basename(file.originalname, ext);
    const targetDirectoryPath = await getFullPath(
      spaceKey,
      path.join(targetPath + '.ink')
    );
    // Create target directory
    await fs.mkdir(targetDirectoryPath, { recursive: true });

    // Write file content
    const contentPath = path.join(targetDirectoryPath, `content${ext}`);
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
 * /documents/{spaceKey}/delete:
 *   delete:
 *     summary: Delete a document from a space
 *     operationId: deleteDocument
 *     tags: [Documents]
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
 *         description: Document deleted successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 */
const deleteDocument = async (ctx: Router.RouterContext) => {
  const spaceKey = ctx.request.params.spaceKey;
  const targetPath = ctx.request.query.path;

  if (!targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing target path';
    return;
  }

  try {
    const targetDirectoryPath = await getFullPath(
      spaceKey,
      path.join(targetPath + '.ink')
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
 * /documents/{spaceKey}/addFolder:
 *   post:
 *     summary: Add a new folder within a space
 *     operationId: addFolder
 *     tags: [Documents]
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
  const spaceKey = ctx.request.params.spaceKey;
  const targetPath = ctx.request.query.path;

  if (!targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing target path';
    return;
  }

  try {
    const targetDirectoryPath = await getFullPath(
      spaceKey,
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

/**
 * @swagger
 * /documents/{spaceKey}/deleteFolder:
 *   delete:
 *     summary: Delete a folder within a space
 *     operationId: deleteFolder
 *     tags: [Documents]
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
 *         description: The relative path within the space where the folder should be deleted
 *     responses:
 *       200:
 *         description: Folder deleted successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or folder not found.
 */
const deleteFolder = async (ctx: Router.RouterContext) => {
  const spaceKey = ctx.request.params.spaceKey;
  const targetPath = ctx.request.query.path;

  if (!targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing target path';
    return;
  }

  try {
    const targetDirectoryPath = await getFullPath(
      spaceKey,
      path.join(targetPath)
    );

    await fs.rm(targetDirectoryPath, { recursive: true, force: true });
    ctx.status = 200;
    ctx.body = 'Folder deleted successfully';
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: error.message };
    logger.error(`Failed to delete folder: ${error.message}`);
  }
};

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
const addDocumentTags = async (ctx: Router.RouterContext) => {
  const { spaceKey } = ctx.params;
  const { tags } = ctx.request.body;
  const { path: documentPath } = ctx.request.query;

  const documentDirectory = documentPath + '.ink';
  try {
    // Retrieve the full path for the document storage space
    const spaceRoot = await getFullPath(spaceKey, '');
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
const removeDocumentTags = async (ctx: Router.RouterContext) => {
  const { spaceKey } = ctx.params;
  const { tags } = ctx.request.body;
  const { path: documentPath } = ctx.request.query;

  const documentDirectory = documentPath + '.ink';
  try {
    const spaceRoot = await getFullPath(spaceKey, '');
    const metaFilePath = path.join(spaceRoot, documentDirectory, 'meta.json');

    const fileMetaStr = await fs.readFile(metaFilePath, 'utf-8');
    const meta = JSON.parse(fileMetaStr);

    const existingTags = meta.tags ?? [];
    // Remove the specified tags
    meta.tags = existingTags.filter((tag) => !tags.includes(tag));

    await fs.writeFile(metaFilePath, JSON.stringify(meta), 'utf-8');

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
const getDocumentTags = async (ctx: Router.RouterContext) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path;
  const documentDirectory = documentPath + '.ink';

  try {
    const spaceRoot = await getFullPath(spaceKey, '');
    const metaFilePath = path.join(spaceRoot, documentDirectory, 'meta.json');

    const fileMetaStr = await fs.readFile(metaFilePath, 'utf-8');
    const meta = JSON.parse(fileMetaStr);

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

// Register routes and export
export const registerDocumentRoutes = (router: Router) => {
  router.get('/documents/:spaceKey/list', listDocuments);
  router.get('/documents/:spaceKey/content', getDocumentContent);
  router.post(
    '/documents/:spaceKey/add',
    upload.single('document'),
    addDocument
  );
  router.post('/documents/:spaceKey/addFolder', addFolder);
  router.delete('/documents/:spaceKey/deleteFolder', deleteFolder);
  router.delete('/documents/:spaceKey/delete', deleteDocument);
  router.get('/documents/:spaceKey/tags', getDocumentTags);
  router.post('/documents/:spaceKey/tags', addDocumentTags);
  router.delete('/documents/:spaceKey/tags', removeDocumentTags);
};
