import { Context, Annotation } from '~/server/types';

/**
 * @swagger
 * /documents/{spaceKey}/annotations:
 *   get:
 *     summary: Retrieve annotations of a document in a specific space
 *     tags: [Documents]
 *     operationId: getDocumentAnnotations
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
 *         description: Retrieved annotations of the document.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Annotation'
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to retrieve the annotations due to server error.
 */
export const getDocumentAnnotations = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path as string;

  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const fileContent = await fileManager.readAnnotationFile(documentPath);
  const annotations = JSON.parse(fileContent);
  ctx.status = 200;
  ctx.body = annotations ?? [];
};

/**
 * @swagger
 * /documents/{spaceKey}/annotations:
 *   post:
 *     summary: Add annotations of a document in a specific space
 *     tags: [Documents]
 *     operationId: addDocumentAnnotation
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
 *       description: JSON object containing annotations to add or update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Annotation'
 *     responses:
 *       200:
 *         description: Annotations added or updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Annotation'
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to add or update the annotations due to server error.
 */
export const addDocumentAnnotation = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path as string;
  const fileManager = await ctx.fileService.getFileManager(spaceKey);

  const fileContent = await fileManager.readAnnotationFile(documentPath);
  const existingAnnotations = JSON.parse(fileContent) ?? [];
  const newAnnotation = ctx.request.body as Annotation;

  // Merge existing annotations with the new ones
  const timestamp = new Date().getTime().toString();
  const created = {
    ...newAnnotation,
    id: timestamp,
  };
  const updatedAnnotations = [...existingAnnotations, created];

  await fileManager.writeAnnotationFile(
    documentPath,
    JSON.stringify(updatedAnnotations)
  );

  ctx.status = 200;
  ctx.body = created;
};

/**
 * @swagger
 * /documents/{spaceKey}/annotations:
 *   put:
 *     summary: Update annotations of a document in a specific space
 *     tags: [Documents]
 *     operationId: updateDocumentAnnotation
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
 *       description: JSON object containing annotations to add or update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Annotation'
 *     responses:
 *       200:
 *         description: Annotations added or updated successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to add or update the annotations due to server error.
 */
export const updateDocumentAnnotation = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path as string;

  const fileManager = await ctx.fileService.getFileManager(spaceKey);
  const fileContent = await fileManager.readAnnotationFile(documentPath);
  const annotations = (JSON.parse(fileContent) as Annotation[]) ?? [];
  const update = ctx.request.body as Annotation;

  // Merge existing annotations with the new ones
  const index = annotations.findIndex((a) => a.id === update.id);
  if (index != -1) {
    annotations[index] = {
      ...annotations[index],
      ...update,
    };
  }

  await fileManager.writeAnnotationFile(
    documentPath,
    JSON.stringify(annotations)
  );

  ctx.status = 200;
  ctx.body = 'Annotations updated successfully.';
};

/**
 * @swagger
 * /documents/{spaceKey}/annotations:
 *   delete:
 *     summary: Delete annotations from a document in a specific space
 *     tags: [Documents]
 *     operationId: deleteDocumentAnnotations
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
 *       description: JSON array containing ids of annotations to delete
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *     responses:
 *       200:
 *         description: Annotations deleted successfully.
 *       400:
 *         description: Invalid parameters provided.
 *       404:
 *         description: Space or document not found.
 *       500:
 *         description: Unable to delete the annotations due to server error.
 */
export const deleteDocumentAnnotations = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const documentPath = ctx.query.path as string;
  const fileManager = await ctx.fileService.getFileManager(spaceKey);

  const fileContent = await fileManager.readAnnotationFile(documentPath);
  const existingAnnotations = (JSON.parse(fileContent) as Annotation[]) ?? [];
  const deletions = ctx.request.body as string[];

  // Filter out the annotations to be deleted
  const remainingAnnotations = existingAnnotations.filter(
    (a) => !deletions.includes(a.id)
  );

  await fileManager.writeAnnotationFile(
    documentPath,
    JSON.stringify(remainingAnnotations)
  );

  ctx.status = 200;
  ctx.body = 'Annotations deleted successfully.';
};
