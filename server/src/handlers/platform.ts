import Router from 'koa-router';
import os from 'os';
import path from 'path';
import logger from '~/server/logger';
import fs from 'fs/promises';
import * as drivelist from 'drivelist';
const router = new Router();

/**
 * @swagger
 * /platform:
 *   get:
 *     summary: Get platform information
 *     tags: [Platform]
 *     description: This endpoint returns the platform and home directory information of the server.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 platform:
 *                   type: string
 *                   description: The platform of the server.
 *                 homedir:
 *                   type: string
 *                   description: The home directory of the server.
 *                 pathSep:
 *                   type: string
 *                   description: The path separator of the server.
 *                 drives:
 *                   type: array
 *                   items:
 *                     type: string
 *               required:
 *                 - platform
 *                 - homedir
 *                 - pathSep
 */
const platformInfo = async (ctx) => {
  const drives = await drivelist.list();
  ctx.body = {
    platform: os.platform(),
    homedir: os.homedir(),
    pathSep: path.sep,
    dirves:
      os.platform() == 'win32'
        ? drives.map((d) => (d.mountpoints[0] ? d.mountpoints[0].path : null))
        : null,
  };
};

/**
 * @swagger
 * /platform/directories/{path}:
 *   get:
 *     summary: List directories of a specified path
 *     description: This endpoint returns a list of directories in the specified path.
 *     tags: [Platform]
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The path of the folder to list.
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the directory.
 *                   path:
 *                     type: string
 *                     description: The full path of the directory.
 *                 required:
 *                   - name
 *                   - path
 *       404:
 *         description: The specified folder does not exist.
 *       400:
 *         description: An error occurred while trying to list the folder.
 */
const listDirectories = async (ctx) => {
  const fullPath = ctx.params.path;

  try {
    const files = await fs.readdir(fullPath, { withFileTypes: true });
    const directories = files.filter((f) => f.isDirectory());
    const symbolicLinks = files.filter((f) => f.isSymbolicLink());
    for (const link of symbolicLinks) {
      const realpath = await fs.realpath(path.join(fullPath, link.name));
      const stat = await fs.stat(realpath);
      if (stat.isDirectory()) {
        directories.push(link);
      }
    }
    ctx.body = directories.map((file) => ({
      name: file.name,
      path: path.join(fullPath, file.name),
    }));

    ctx.status = 200;
  } catch (error) {
    ctx.status = error.message.includes('does not exist') ? 404 : 400;
    ctx.body = { message: error.message };
  }
};

export const registerPlatformRoutes = (router: Router) => {
  router.get('/platform', platformInfo);
  router.get('/platform/directories/:path', listDirectories);
};

export default router;