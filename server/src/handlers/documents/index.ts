import Router from '@koa/router';
import os from 'os';
import send from 'koa-send';
import path from 'path';
import multer, { File } from '@koa/multer';
import logger from '~/server/logger'; // Make sure to import your configured logger

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
import { ImportDocumentRequest } from '@inkstain/client-api';

const isValidFileName = (filePath: string): boolean => {
  // List of illegal characters for Windows and Unix-like systems
  const illegalCharacters = /[/\0<>:"\\|?*]/g;
  // Check if the file path contains any illegal characters
  return !illegalCharacters.test(filePath);
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
 *       - in: query
 *         name: folderOnly
 *         schema:
 *           type: string
 *           enum: [0, 1]
 *         description: Whether to only return folders
 *     responses:
 *       200:
 *         description: A list of documents and sub-folders within the space or sub-folder.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DocumentListItem'
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or sub-folder not found.
 */
const listDocuments = async (ctx: Context) => {
  const spaceKey = ctx.params.spaceKey;
  const filePath = ctx.query.path as string;
  const folderOnly = ctx.query.folderOnly === '1';
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const data = await fileManager.readDir(filePath);
  ctx.status = 200;
  if (folderOnly) {
    ctx.body = data.filter((item) => item.type === 'folder');
  } else {
    ctx.body = data;
  }
  logger.info(
    `Listed documents in space '${spaceKey}' at path '${filePath || '/'}'`
  );
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
  const filePath = ctx.query.path as string;
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const fileMetaStr = await fileManager.readMetaFile(filePath);
  const meta = JSON.parse(fileMetaStr);
  const extension = path.extname(filePath);
  ctx.response.type = meta.mimetype;
  await send(ctx, path.join(`${filePath}.ink`, `content${extension}`), {
    root: fileManager.space.path,
  });
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
  const filePath = ctx.query.path as string;
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const actualPath = fileManager.getDocumentContentPath(filePath);
  const open = await import('open');
  // If parameters or parameter values contain a space, they need to be surrounded with escaped double quotes.
  // For more information, see https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_quoting_rules?view=powershell-7.4&viewFallbackFrom=powershell-7.1.
  open.default(
    os.platform() === 'win32' ? '`"' + actualPath + '`"' : actualPath
  );
  ctx.status = 200;
  ctx.body = { message: 'Document opened successfully' };
  logger.info(`Opened document at ${actualPath}`);
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
  const file = ctx.request.file as File | undefined; // assuming file is uploaded through a form and handled by middleware
  let targetPath = ctx.request.query.path as string | undefined;
  const spaceKey = ctx.params.spaceKey;

  if (!file || !targetPath) {
    ctx.status = 400;
    ctx.body = 'Missing file or target path';
    return;
  }
  if (targetPath.startsWith(path.sep)) {
    targetPath = targetPath.replace(path.sep, '');
  }
  const fileName = path.basename(targetPath);
  if (!isValidFileName(fileName)) {
    ctx.throw(400, 'Invalid file name');
  }
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  await fileManager.addDocument(targetPath, file);
  await ctx.documentService.indexDocument(spaceKey, targetPath);
  ctx.status = 201;
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
    ctx.throw(400, 'Missing target path');
  }
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  await ctx.documentService.deleteDocument(spaceKey, targetPath);
  await fileManager.removeDocument(targetPath);
  ctx.status = 200;
  ctx.body = 'Document deleted successfully';
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
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  await fileManager.addFolder(targetPath);
  ctx.status = 200;
  ctx.body = 'Folder created successfully';
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
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const documentsToIndex = await fileManager.findDocumentsUnderFolder(
    targetPath
  );
  for (const doc of documentsToIndex) {
    ctx.documentService.deleteDocument(spaceKey, doc);
  }
  await fileManager.removeFolder(targetPath);
  ctx.status = 200;
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
  const filePath = ctx.request.query.path as string;
  const withData = ctx.request.query.withData === '1';

  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  // const spaceRoot = await getFullPath(ctx.spaceService, spaceKey, '');
  const fileMetaStr = await fileManager.readMetaFile(filePath);
  const meta = JSON.parse(fileMetaStr) as MetaData;
  const fileName =
    meta.attributes?.title ||
    (ctx.request.query.path as string).replace(
      path.basename(ctx.request.query.path as string),
      ''
    );
  if (withData) {
    ctx.set('Content-disposition', `attachment; filename=${fileName}.ink.zip`);
    ctx.set('Content-type', 'application/zip');
    ctx.body = await fileManager.exportDocumentWithData(filePath);
  } else {
    ctx.set(
      'Content-disposition',
      `attachment; filename=${meta.attributes?.title || fileName}`
    );
    ctx.set('Content-type', meta.mimetype);
    // Stream the file content
    ctx.body = fileManager.exportDocument(filePath);
  }
};

/**
 * @swagger
 * /documents/{spaceKey}/renameDocument:
 *   put:
 *     summary: Rename a document
 *     tags: [Documents]
 *     operationId: renameDocument
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
 *         description: The relative path to the document within the space
 *       - in: query
 *         name: newPath
 *         required: true
 *         schema:
 *           type: string
 *         description: The new name for the document
 *     responses:
 *       200:
 *         description: Document renamed successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       409:
 *         description: A document with the new name already exists.
 */
const renameDocument = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const oldPath = ctx.query.path as string;
  const newPath = ctx.query.newPath as string;
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  await ctx.documentService.updateDocumentPath(spaceKey, oldPath, newPath);
  await fileManager.renameDocument(oldPath, newPath);
  ctx.status = 200;
  ctx.body = { message: 'Document renamed successfully', newPath };
  logger.info(`Renamed document ${oldPath} to ${newPath} in space ${spaceKey}`);
};

/**
 * @swagger
 * /documents/{spaceKey}/renameFolder:
 *   put:
 *     summary: Rename a folder
 *     tags: [Documents]
 *     operationId: renameFolder
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
 *         description: The relative path to the folder within the space
 *       - in: query
 *         name: newPath
 *         required: true
 *         schema:
 *           type: string
 *         description: The new name for the folder
 *     responses:
 *       200:
 *         description: Folder renamed successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or folder not found.
 *       409:
 *         description: A folder with the new name already exists.
 */
const renameFolder = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const oldPath = ctx.query.path as string;
  const newPath = ctx.query.newPath as string;
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const documentsToUpdate = await fileManager.findDocumentsUnderFolder(oldPath);
  const space = await ctx.spaceService.getSpace(spaceKey);
  for (const doc of documentsToUpdate) {
    await ctx.documentService.updateDocumentPath(
      space.key,
      doc,
      doc.replace(oldPath, newPath)
    );
  }
  await fileManager.renameFolder(oldPath, newPath);
  ctx.status = 200;
  ctx.body = { message: 'Folder renamed successfully', newPath };
  logger.info(`Renamed folder ${oldPath} to ${newPath} in space ${spaceKey}`);
};

/**
 * @swagger
 * /documents/{spaceKey}/import:
 *   post:
 *     summary: Import a document
 *     tags: [Documents]
 *     operationId: importDocument
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The key of the space
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               localFilePath:
 *                 type: string
 *                 description: Local file path of the document to import
 *               targetPath:
 *                 type: string
 *                 description: Target path within the space to import the document
 *               mimeType:
 *                 type: string
 *                 description: MIME type of the document to import
 *             required:
 *               - localFilePath
 *               - targetPath
 *               - mimeType
 *     responses:
 *       200:
 *         description: Document imported successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       500:
 *         description: Unable to import the document due to server error.
 */
const importDocument = async (ctx: Context) => {
  const spaceKey = ctx.params.spaceKey;
  const {
    localFilePath,
    targetPath: targetPathParam,
    mimeType,
  } = ctx.request.body as ImportDocumentRequest;
  let targetPath = targetPathParam;
  if (targetPath.startsWith(path.sep)) {
    targetPath = targetPath.replace(path.sep, '');
  }
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  await fileManager.importDocument(localFilePath, targetPath, mimeType);
  await ctx.documentService.indexDocument(spaceKey, targetPath);
  ctx.status = 200;
  ctx.body = { message: 'Document imported successfully', targetPath };
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

  // document rename
  router.put('/documents/:spaceKey/renameDocument', renameDocument);
  router.put('/documents/:spaceKey/renameFolder', renameFolder);

  router.get('/documents/:spaceKey/export', exportDocument);
  router.post('/documents/:spaceKey/import', importDocument);
};
