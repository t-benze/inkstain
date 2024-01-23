import Router from 'koa-router';
import send from 'koa-send';
import path from 'path';
import fs from 'fs/promises';

// Configure static file serving
const staticRoot = path.join(__dirname, '../public'); // Adjust public folder path as needed

// Helper function to list directory contents
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

// Document listing endpoint
const listDocuments = async (ctx: Router.RouterContext) => {
  const urlPath = ctx.params[0] || ''; // Capture the slug after /list/
  const dirRelPath = path.normalize(decodeURIComponent(urlPath));

  // Prevent directory traversal attacks
  if (dirRelPath.includes('..')) {
    ctx.throw(400, 'Invalid directory path.');
    return;
  }

  try {
    ctx.body = await listDirectoryContents(dirRelPath);
    ctx.status = 200;
  } catch (err) {
    ctx.throw(404, err.message);
  }
};

// Static file serving endpoint for documents
const getDocumentContent = async (ctx: Router.RouterContext) => {
  const urlPath = ctx.params[0] || ''; // Capture the slug after /content/
  const filePath = path.normalize(decodeURIComponent(urlPath));

  // Prevent directory traversal attacks
  if (filePath.includes('..')) {
    ctx.throw(400, 'Invalid file path.');
    return;
  }

  const fullPath = path.join(staticRoot, filePath);

  try {
    await send(ctx, fullPath, { root: staticRoot });
  } catch (err) {
    ctx.throw(404, 'Document not found.');
  }
};

// Export route registration function
export const documentRoutes = (router: Router) => {
  router.get('/documents/list/(.*)', listDocuments); // Match all slugs after /list/
  router.get('/documents/content/(.*)', getDocumentContent); // Match all slugs after /content/
};
