import Router from '@koa/router';
import os from 'os';
import send from 'koa-send';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream, createReadStream } from 'fs';
import { PassThrough } from 'stream';
import multer, { File } from '@koa/multer';
import {
  SpaceServiceError,
  ErrorCode as SpaceServiceErrorCode,
} from '~/server/services/SpaceService';
import logger from '~/server/logger'; // Make sure to import your configured logger
import archiver from 'archiver';

import {
  getDocumentAttributes,
  addUpdateDocumentAttributes,
  deleteDocumentAttributes,
} from './attributes';
import {
  getDocumentAnnotations,
  addDocumentAnnotation,
  updateDocumentAnnotation,
  deleteDocumentAnnotations,
} from './annotation';

import { getDocumentTags, addDocumentTags, removeDocumentTags } from './tags';
import { Context, MetaData } from '~/server/types';
import { traverseDirectory, getFullPath } from '~/server/utils';

/**
 * Zips the contents of the specified folder and returns a buffer.
 * @param folderPath - The path of the folder to zip.
 * @returns A promise that resolves with the zip buffer.
 */
export const zipFolder = (folderPath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    const buffers: Buffer[] = [];
    const passthrough = new PassThrough();

    passthrough.on('data', (chunk) => buffers.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(buffers)));
    passthrough.on('error', (err) => reject(err));

    archive.on('error', (err) => reject(err));

    archive.pipe(passthrough);

    // Append files from the directory
    archive.directory(folderPath, false);

    // Finalize the archive (i.e., we are done appending files but streams have to finish yet)
    archive.finalize();
  });
};

const upload = multer({
  storage: multer.memoryStorage(),
});
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
const listDocuments = async (ctx: Context) => {
  const spaceKey = ctx.params.spaceKey;
  const filePath = ctx.query.path as string;

  try {
    const fullPath = await getFullPath(ctx.spaceService, spaceKey, filePath);
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
const getDocumentContent = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const filePath = ctx.query.path + '.ink';
  try {
    const spaceRoot = await getFullPath(ctx.spaceService, spaceKey, '');
    const fileMetaStr = await fs.readFile(
      path.join(spaceRoot, filePath, 'meta.json'),
      'utf-8'
    );
    const extension = path.extname(ctx.query.path as string);
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
 * /documents/{spaceKey}/open:
 *   get:
 *     summary: Open a document with the system app
 *     tags: [Documents]
 *     operationId: openDocumentWithSystemApp
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
 *         description: Document opened successfully.
 *       500:
 *         description: Failed to open document.
 */
const openDocumentWithSystemApp = async (ctx: Context) => {
  const spaceKey = ctx.params.spaceKey;
  const filePath = ctx.query.path + '.ink';
  const open = await import('open');
  try {
    const fullPath = await getFullPath(ctx.spaceService, spaceKey, filePath);
    const extension = path.extname(ctx.query.path as string);
    const file = path.join(fullPath, `content${extension}`);
    // If parameters or parameter values contain a space, they need to be surrounded with escaped double quotes.
    // For more information, see https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.4&viewFallbackFrom=powershell-7.1.
    open.default(os.platform() === 'win32' ? '`"' + file + '`"' : file);
    ctx.status = 200;
    ctx.body = { message: 'Document opened successfully' };
    logger.info(`Opened document at ${file}`);
  } catch (error) {
    ctx.status = 500;
    ctx.body = { message: error.message };
    logger.error(`Failed to open document: ${error.message}`);
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
const addDocument = async (ctx: Context) => {
  const file = ctx.request.file as File; // assuming file is uploaded through a form and handled by middleware
  const targetPath = ctx.request.query.path as string;
  const spaceKey = ctx.params.spaceKey;

  if (!file || !targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing file or target path';
    return;
  }

  try {
    const ext = path.extname(file.originalname);
    // const filename = path.basename(file.originalname, ext);
    const targetDirectoryPath = await getFullPath(
      ctx.spaceService,
      spaceKey,
      targetPath + '.ink'
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
    const space = await ctx.spaceService.getSpace(spaceKey);
    await ctx.documentService.indexDocument(space, targetPath);
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
const deleteDocument = async (ctx: Context) => {
  const spaceKey = ctx.params.spaceKey;
  const targetPath = ctx.request.query.path as string;

  if (!targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing target path';
    return;
  }

  try {
    const targetDirectoryPath = await getFullPath(
      ctx.spaceService,
      spaceKey,
      targetPath + '.ink'
    );

    await fs.rm(targetDirectoryPath, { recursive: true, force: true });
    const space = await ctx.spaceService.getSpace(spaceKey);
    await ctx.documentService.deleteDocument(space, targetPath);
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
const addFolder = async (ctx: Context) => {
  const spaceKey = ctx.params.spaceKey;
  const targetPath = ctx.request.query.path as string;

  if (!targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing target path';
    return;
  }

  try {
    const targetDirectoryPath = await getFullPath(
      ctx.spaceService,
      spaceKey,
      targetPath
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
const deleteFolder = async (ctx: Context) => {
  const spaceKey = ctx.params.spaceKey;
  const targetPath = ctx.request.query.path as string;

  if (!targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing target path';
    return;
  }

  try {
    const targetDirectoryPath = await getFullPath(
      ctx.spaceService,
      spaceKey,
      targetPath
    );
    const space = await ctx.spaceService.getSpace(spaceKey);
    const documentsToIndex = [];
    await traverseDirectory(space.path, targetDirectoryPath, documentsToIndex);
    for (const doc of documentsToIndex) {
      ctx.documentService.deleteDocument(space, doc);
    }
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
 * /documents/{spaceKey}/export:
 *   get:
 *     summary: Export a document to a different format
 *     operationId: exportDocument
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
 *       - in: query
 *         name: withData
 *         schema:
 *           type: string
 *         description: 1 to export the document with InkStain data, 0 to export the document without InkStain data
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               description: Attachment header with filename
 *           Content-Type:
 *             schema:
 *               type: string
 *               description: MIME type of the document
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 */
export const exportDocument = async (ctx: Context) => {
  const spaceKey = ctx.params.spaceKey;
  const filePath = (ctx.request.query.path as string) + '.ink';
  const withData = ctx.request.query.withData === '1';

  try {
    const spaceRoot = await getFullPath(ctx.spaceService, spaceKey, '');
    const fileMetaStr = await fs.readFile(
      path.join(spaceRoot, filePath, 'meta.json'),
      'utf-8'
    );
    const meta = JSON.parse(fileMetaStr) as MetaData;
    const fileName =
      meta.attributes.title ||
      (ctx.request.query.path as string).replace(
        path.basename(ctx.request.query.path as string),
        ''
      );
    const extension = path.extname(ctx.query.path as string);
    if (withData) {
      ctx.set(
        'Content-disposition',
        `attachment; filename=${fileName}.ink.zip`
      );
      ctx.set('Content-type', 'application/zip');
      ctx.body = await zipFolder(path.join(spaceRoot, filePath));
    } else {
      ctx.set(
        'Content-disposition',
        `attachment; filename=${meta.attributes.title || fileName}`
      );
      ctx.set('Content-type', meta.mimetype);
      // Stream the file content
      ctx.body = createReadStream(
        path.join(spaceRoot, filePath, `content${extension}`)
      );
    }
    // Log the successful operation
    logger.info(`exported document from ${path.join(filePath, 'content')}`);
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
// Register routes and export
export const registerDocumentRoutes = (router: Router) => {
  // document files and folders
  router.get('/documents/:spaceKey/list', listDocuments);
  router.get('/documents/:spaceKey/content', getDocumentContent);
  router.get('/documents/:spaceKey/open', openDocumentWithSystemApp);
  router.post(
    '/documents/:spaceKey/add',
    upload.single('document'),
    addDocument
  );
  router.post('/documents/:spaceKey/addFolder', addFolder);
  router.delete('/documents/:spaceKey/deleteFolder', deleteFolder);
  router.delete('/documents/:spaceKey/delete', deleteDocument);

  // document tags
  router.get('/documents/:spaceKey/tags', getDocumentTags);
  router.post('/documents/:spaceKey/tags', addDocumentTags);
  router.delete('/documents/:spaceKey/tags', removeDocumentTags);
  // document attributes
  router.get('/documents/:spaceKey/attributes', getDocumentAttributes);
  router.post('/documents/:spaceKey/attributes', addUpdateDocumentAttributes);
  router.delete('/documents/:spaceKey/attributes', deleteDocumentAttributes);

  // document annotations
  router.get('/documents/:spaceKey/annotations', getDocumentAnnotations);
  router.post('/documents/:spaceKey/annotations', addDocumentAnnotation);
  router.put('/documents/:spaceKey/annotations', updateDocumentAnnotation);
  router.delete('/documents/:spaceKey/annotations', deleteDocumentAnnotations);

  router.get('/documents/:spaceKey/export', exportDocument);
};
