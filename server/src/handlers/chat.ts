import Router from '@koa/router';
import { ChatError } from '~/server/services/ChatService';
import { Context, CommonHTTPErrorData } from '~/server/types';

/**
 * @swagger
 * /chat/{spaceKey}/session:
 *   post:
 *     summary: initiate a chat session and handle user query
 *     tags: [Chat]
 *     operationId: chatNewSession
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
 *         name: withDocument
 *         required: false
 *         description: Include document content in the chat session, '1' = include, '0' = exclude
 *         schema:
 *           type: string
 *     requestBody:
 *       description: The user message to initiate the chat session
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The user message
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: Chat session initiated and user query handled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 *               required:
 *                 - sessionId
 *                 - data
 *       400:
 *         description: Invalid parameters provided.
 *       500:
 *         description: Unable to initiate chat session due to server error.
 */
const newChatSession = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { path: documentPath, withDocument } = ctx.query as {
    path: string;
    withDocument?: string;
  };
  const { message } = ctx.request.body as {
    message: string;
  };

  try {
    const { sessionId, response } = await ctx.chatService.createSession(
      spaceKey,
      documentPath,
      message,
      withDocument === '1'
    );
    ctx.status = 200;
    ctx.body = {
      sessionId,
      data: response,
    };
  } catch (error) {
    if (error instanceof ChatError) {
      ctx.throw(400, error.message, new CommonHTTPErrorData(error.code));
    } else {
      throw error;
    }
  }
};

/**
 * @swagger
 * /chat/{spaceKey}/session:
 *   get:
 *     summary: Get chat session details
 *     tags: [Chat]
 *     operationId: getChatSession
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the space
 *       - in: query
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The chat session ID
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat session details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *                 sessionId:
 *                   type: string
 *                 withDocument:
 *                   type: boolean
 *               required:
 *                 - data
 *                 - sessionId
 *                 - withDocument
 *       404:
 *         description: Chat session not found
 *       500:
 *         description: Server error
 */
const getChatSession = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { sessionId, path: documentPath } = ctx.query as {
    path: string;
    sessionId: string;
  };

  const { messages, withDocument } = await ctx.chatService.loadChatSession(
    spaceKey,
    documentPath,
    sessionId
  );
  ctx.status = 200;
  ctx.body = {
    sessionId,
    withDocument,
    data: messages.filter((m) => m.role === 'user' || m.role === 'assistant'),
  };
};

/**
 * @swagger
 * /chat/{spaceKey}/sessions:
 *   get:
 *     summary: Get list of chat sessions
 *     tags: [Chat]
 *     operationId: getSessionList
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
 *         description: List of chat sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Server error
 */
const getSessionList = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { path: documentPath } = ctx.query as {
    path: string;
  };
  const sessions = await ctx.chatService.getChatSessionList(
    spaceKey,
    documentPath
  );
  ctx.status = 200;
  ctx.body = sessions;
};

/**
 * @swagger
 * /chat/{spaceKey}/message:
 *   post:
 *     summary: Send a new chat message and get AI response
 *     operationId: chatNewMessage
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: spaceKey
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the space
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
 *               message:
 *                 type: string
 *                 description: The user's chat message
 *               sessionId:
 *                 type: string
 *                 description: The chat session id
 *     responses:
 *       200:
 *         description: Successfully processed chat message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 */
const newChatMessage = async (ctx: Context) => {
  const { spaceKey } = ctx.params;
  const { path: documentPath } = ctx.query as {
    path: string;
  };
  const { message, sessionId } = ctx.request.body as {
    message: string;
    sessionId: string;
  };

  try {
    const responseMessage = await ctx.chatService.handleUserQuery(
      spaceKey,
      documentPath,
      sessionId,
      message
    );
    ctx.status = 200;
    ctx.body = responseMessage;
  } catch (error) {
    if (error instanceof ChatError) {
      ctx.throw(400, error.message, new CommonHTTPErrorData(error.code));
    } else {
      throw error;
    }
  }
};

export const registerChatRoutes = (router: Router) => {
  router.get('/chat/:spaceKey/sessions', getSessionList);
  router.get('/chat/:spaceKey/session', getChatSession);
  router.post('/chat/:spaceKey/session', newChatSession);
  router.post('/chat/:spaceKey/message', newChatMessage);
};
