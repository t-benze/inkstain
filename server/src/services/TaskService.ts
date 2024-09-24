/**
 * A task manager service to execute long-running tasks and track their progress.
 */

import EventEmitter from 'events';
import crypto from 'crypto';
import logger from '~/server/logger';

type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

interface Task {
  status: TaskStatus;
  progress: number;
  taskFunction: (progressCallback: (progress: number) => void) => Promise<void>;
}

interface TaskEvents {
  taskAdded: (taskId: string) => void;
  taskStarted: (taskId: string) => void;
  taskProgress: (taskId: string, progress: number) => void;
  taskCompleted: (taskId: string) => void;
  taskFailed: (taskId: string, error: Error) => void;
}

export class TaskService extends EventEmitter {
  private tasks: Map<string, Task> = new Map();

  on<U extends keyof TaskEvents>(event: U, listener: TaskEvents[U]): this {
    super.on(event, listener);
    return this;
  }

  emit<U extends keyof TaskEvents>(
    event: U,
    ...args: Parameters<TaskEvents[U]>
  ): boolean {
    return super.emit(event, ...args);
  }

  constructor() {
    super();
    this.tasks = new Map();
  }

  generateTaskId() {
    return crypto.randomBytes(8).toString('hex');
  }

  addTask(
    taskFunction: (
      progressCallback: (progress: number) => void
    ) => Promise<void>
  ) {
    const taskId = this.generateTaskId();
    this.tasks.set(taskId, { status: 'pending', progress: 0, taskFunction });
    this.emit('taskAdded', taskId);
    return taskId;
  }

  async executeTask(taskId) {
    if (!this.tasks.has(taskId)) {
      throw new Error(`Task with ID ${taskId} does not exist`);
    }

    const task = this.tasks.get(taskId);
    task.status = 'running';
    this.emit('taskStarted', taskId);

    try {
      await task.taskFunction((progress) => {
        task.progress = progress;
        this.emit('taskProgress', taskId, progress);
      });

      task.status = 'completed';
      task.progress = 100;
      this.emit('taskCompleted', taskId);
    } catch (error) {
      logger.error(`Task ${taskId} failed: ${error.message}: ${error.stack}`);
      task.status = 'failed';
      this.emit('taskFailed', taskId, error);
    }
  }

  getTaskStatus(taskId) {
    if (!this.tasks.has(taskId)) {
      throw new Error(`Task with ID ${taskId} does not exist`);
    }
    return this.tasks.get(taskId);
  }
}

/* Example usage
const taskManager = new TaskManager();
// Define a long-running task
const longRunningTask = async (progressCallback) => {
  for (let i = 0; i <= 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate work
    progressCallback(i * 10);
  }
};

// Add and execute the task
const taskId = taskManager.addTask(longRunningTask);

taskManager.on('taskAdded', (id) => console.log(`Task ${id} added`));
taskManager.on('taskStarted', (id) => console.log(`Task ${id} started`));
taskManager.on('taskProgress', (id, progress) =>
  console.log(`Task ${id} progress: ${progress}%`)
);
taskManager.on('taskCompleted', (id) => console.log(`Task ${id} completed`));
taskManager.on('taskFailed', (id, error) =>
  console.log(`Task ${id} failed: ${error.message}`)
);

taskManager.executeTask(taskId);
*/
