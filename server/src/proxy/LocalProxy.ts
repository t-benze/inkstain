import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { DocumentTextDetectionData } from '~/server/types';
import { DocIntelligenceInterface } from './types';
import { directories, analyzeImagePath } from '~/server/settings';
import logger from '~/server/logger';

const inputPath = path.join(directories.stateDir, 'task-input.data');
const outputPath = path.join(directories.stateDir, 'task-output.json');

export class LocalProxy implements DocIntelligenceInterface {
  private pythonProcess = this.startDocAnalysisProcess();
  private eventEmitter: EventEmitter;

  constructor() {
    this.pythonProcess = this.startDocAnalysisProcess();
    this.eventEmitter = new EventEmitter();
  }

  startDocAnalysisProcess() {
    const pythonProcess = spawn(analyzeImagePath, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        INPUT: inputPath,
        OUTPUT: outputPath,
      },
    });
    if (process.env.NODE_ENV == 'development') {
      pythonProcess.stderr.on('data', (data) => {
        console.log(data.toString());
      });
    }
    pythonProcess.stdout.on('data', (data) => {
      const command = data.toString().trim();
      if (command === 'done') {
        this.eventEmitter.emit('done');
      }
    });
    pythonProcess.on('error', (error) => {
      this.eventEmitter.emit('error_exit', error);
      logger.error(`Failed to start doc analysis process: ${error.message}`);
    });
    pythonProcess.on('close', (code) => {
      logger.info(`Doc analysis process exited with code ${code}`);
    });
    process.on('SIGINT', () => {
      pythonProcess.kill();
    });
    process.on('SIGTERM', () => {
      pythonProcess.kill();
    });
    return pythonProcess;
  }

  async analyzeImage(image: string) {
    await fs.writeFile(inputPath, image);
    this.pythonProcess.stdin.write('run\n');
    const startTime = Date.now();
    await new Promise((resolve, reject) => {
      this.eventEmitter.once('done', resolve);
      this.eventEmitter.once('error_exit', reject);
    });
    logger.info(
      `Doc analysis process took ${(Date.now() - startTime) / 1000}s`
    );
    const data = await fs.readFile(outputPath, 'utf8');
    return JSON.parse(data) as DocumentTextDetectionData;
  }
}
