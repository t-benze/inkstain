import Router from '@koa/router';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';
import child_process from 'child_process';
import crypto from 'crypto';
import util from 'util';
import { CommonHTTPErrorData, Context, Settings } from '~/server/types';
import { ChatError } from '../services/ChatService';
const router = new Router();

/**
 * @swagger
 * /system/platform:
 *   get:
 *     summary: Get platform information
 *     operationId: platformInfo
 *     tags: [System]
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
 *                 attributes:
 *                   type: object
 *                   properties:
 *                     attributesWithIndex:
 *                       type: array
 *                       items:
 *                         type: string
 *                     attributes:
 *                       type: array
 *                       items:
 *                         type: string
 *                   required:
 *                     - attributesWithIndex
 *                     - attributes
 *               required:
 *                 - platform
 *                 - homedir
 *                 - pathSep
 *                 - attributes
 */
const platformInfo = async (ctx: Context) => {
  let drives = null;
  const exec = util.promisify(child_process.exec);
  if (os.platform() == 'win32') {
    const { stdout } = await exec('wmic logicaldisk get caption');
    drives = stdout.trim().split(/\s+/).filter(Boolean).slice(1);
  }
  ctx.body = {
    platform: os.platform(),
    homedir: os.homedir(),
    pathSep: path.sep,
    drives,
    attributes: ctx.documentService.getAttributes(),
  };
};

/**
 * @swagger
 * /system/directories:
 *   get:
 *     operationId: listDirectories
 *     summary: List directories of a specified path
 *     description: This endpoint returns a list of directories in the specified path.
 *     tags: [System]
 *     parameters:
 *       - in: query
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
const listDirectories = async (ctx: Context) => {
  const fullPath = ctx.query.path as string;

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
};

/**
 * @swagger
 * /system/settings:
 *   get:
 *     operationId: getSettings
 *     summary: Retrieve system settings
 *     description: Fetches the current system settings.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: A JSON object containing the system settings.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 */
const settings = async (ctx: Context) => {
  const settings = await ctx.settingsService.getSettings();
  ctx.status = 200;
  ctx.body = settings;
};

/**
 * @swagger
 * /system/settings:
 *   put:
 *     operationId: updateSettings
 *     summary: Update system settings
 *     description: Updates the system settings with the provided values.
 *     tags:
 *       - System
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       400:
 *         description: Invalid settings provided
 */
const updateSettings = async (ctx: Context) => {
  const settings = ctx.request.body as Settings;
  const updatedSettings = await ctx.settingsService.updateSettings(settings);
  ctx.status = 200;
  ctx.body = updatedSettings;
};

/**
 * @swagger
 * /system/verify-chat-api-settings:
 *   post:
 *     operationId: verifyChatAPISettings
 *     description: Verifies the chat API settings
 *     tags:
 *       - System
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baseUrl:
 *                 type: string
 *                 description: The key of the secret.
 *               model:
 *                 type: string
 *                 description: The value of the secret.
 *               apiKey:
 *                 type: string
 *                 description: API key
 *             required:
 *               - apiKey
 *     responses:
 *       200:
 *         description: Chat API settings verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKeySecretKey:
 *                   type: string
 *                 model:
 *                   type: string
 *                 baseUrl:
 *                   type: string
 *               required:
 *                 - apiKeySecretKey
 *
 *       400:
 *         description: Invalid secret provided
 */
const verifyChatAPISettings = async (ctx: Context) => {
  const { apiKey, baseUrl, model } = ctx.request.body as {
    apiKey: string;
    baseUrl?: string;
    model?: string;
  };
  try {
    await ctx.chatService.configureChatAPI({
      apiKey: apiKey,
      baseURL: baseUrl,
      model: model,
    });
    // store the actual api key in the secret service
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    await ctx.secretService.storeSecret({
      secretKey: hash,
      secretValue: apiKey,
    });
    ctx.status = 200;
    ctx.body = {
      apiKeySecretKey: hash,
      model,
      baseUrl,
    };
  } catch (err) {
    if (err instanceof ChatError) {
      ctx.throw(400, err.message, new CommonHTTPErrorData(err.code));
    } else {
      throw err;
    }
  }
};

/**
 * @swagger
 * /system/secrets:
 *  get:
 *    operationId: getSecrets
 *    summary: Get secrets
 *    description: Fetches the current secrets.
 *    tags:
 *      - System
 *    parameters:
 *      - in: query
 *        name: secretKey
 *        required: true
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *    responses:
 *      200:
 *        description: A JSON object containing the secrets.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              description: A key-value dictionary containing the requested secrets.
 */
const getSecrets = async (ctx: Context) => {
  const secretKeys = ctx.query.secretKey
    ? Array.isArray(ctx.query.secretKey)
      ? ctx.query.secretKey
      : [ctx.query.secretKey as string]
    : [];

  const result: Record<string, string> = {};
  for (const key of secretKeys) {
    const secret = await ctx.secretService.getSecret(key);
    if (secret) {
      result[key] = secret;
    }
  }
  ctx.status = 200;
  ctx.body = result;
};

export const registerSystemRoutes = (router: Router) => {
  router.get('/system/platform', platformInfo);
  router.get('/system/directories', listDirectories);
  router.get('/system/settings', settings);
  router.put('/system/settings', updateSettings);
  router.post('/system/verify-chat-api-settings', verifyChatAPISettings);
  router.get('/system/secrets', getSecrets);
};

export default router;
