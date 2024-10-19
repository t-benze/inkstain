import { Context, MetaData } from '~/server/types';

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
export const addDocumentTags = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { tags } = ctx.request.body as { tags: string[] };
  const { path: documentPath } = ctx.request.query as { path: string };
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const fileContent = await fileManager.readMetaFile(documentPath);
  const meta = JSON.parse(fileContent) as MetaData;

  const existingTags = meta.tags ?? [];

  // Add new tags while avoiding duplicates
  const updatedTags = new Set([...existingTags, ...tags]);
  meta.tags = [...updatedTags];

  // Save updated metadata
  await fileManager.writeMetaFile(documentPath, JSON.stringify(meta));
  await ctx.documentService.indexDocument(spaceKey, documentPath);

  ctx.status = 200;
  ctx.body = 'Tags were successfully added to the document.';
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
export const removeDocumentTags = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { tags } = ctx.request.body as { tags: string[] };
  const { path: documentPath } = ctx.request.query as { path: string };
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const fileContent = await fileManager.readMetaFile(documentPath);
  const meta = JSON.parse(fileContent) as MetaData;

  const existingTags = meta.tags ?? [];

  // Remove the specified tags
  meta.tags = existingTags.filter((tag) => !tags.includes(tag));

  await fileManager.writeMetaFile(documentPath, JSON.stringify(meta));
  await ctx.documentService.indexDocument(spaceKey, documentPath);

  ctx.status = 200;
  ctx.body = 'Tags were successfully removed from the document.';
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
export const getDocumentTags = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path as string;
  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const fileContent = await fileManager.readMetaFile(documentPath);
  const meta = JSON.parse(fileContent) as MetaData;
  ctx.status = 200;
  ctx.body = meta.tags ?? [];
};
