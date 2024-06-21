import Router from '@koa/router';
import { Context } from '~/server/types';
import logger from '~/server/logger';

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get the progress of a task
 *     operationId: getTaskStatus
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the task to get progress from
 *     responses:
 *       200:
 *         description: Task progress retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Task does not exist or bad request.
 *       500:
 *         description: Failed to retrieve task progress.
 */
export const getTaskStatus = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const task = await ctx.taskService.getTaskStatus(id);
    ctx.status = 200;
    ctx.body = {
      status: task.status,
      progress: task.progress,
    };
    logger.info(
      `Task ${id} status: ${task.status}, progress: ${task.progress}`
    );
  } catch (error) {
    ctx.status = error.message.includes('does not exist') ? 400 : 500;
    ctx.body = error.message;
  }
};

export const registerTaskRoutes = (router: Router) => {
  router.get('/tasks/:id', getTaskStatus);
};
