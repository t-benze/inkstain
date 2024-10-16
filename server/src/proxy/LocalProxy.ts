import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path, { join } from 'path';
import {
  AuthProxy,
  IntelligenceProxy,
  SignUpRequest,
  ConfirmSignUpRequest,
  SignInRequest,
  ForgotPasswordRequest,
  ConfirmForgotPasswordRequest,
  DocumentTextDetectionData,
} from '~/server/types';
import { directories, analyzeImagePath } from '~/server/settings';
import logger from '../logger';

const inputPath = path.join(directories.stateDir, 'task-input.data');
const outputPath = path.join(directories.stateDir, 'task-output.json');

export class LocalProxy implements AuthProxy, IntelligenceProxy {
  private pythonProcess: ChildProcess | null = null;
  private stopTimer: NodeJS.Timeout | null = null;
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  async startDocAnalysisProcess() {
    this.pythonProcess = spawn(analyzeImagePath, [], {
      env: {
        INPUT: inputPath,
        OUTPUT: outputPath,
      },
    });
    if (process.env.NODE_ENV == 'development') {
      this.pythonProcess.stderr.on('data', (data) => {
        console.log(data.toString());
      });
    }
    this.pythonProcess.stdout.on('data', (data) => {
      const command = data.toString().trim();
      if (command === 'done') {
        this.eventEmitter.emit('done');
      }
    });
    this.pythonProcess.on('error', (error) => {
      this.eventEmitter.emit('error_exit', error);
      logger.error(`Failed to start doc analysis process: ${error.message}`);
    });
    this.pythonProcess.on('close', (code) => {
      logger.info(`Doc analysis process exited with code ${code}`);
    });
    // await new Promise((resolve, reject) => {
    //   this.eventEmitter.once('ready', resolve);
    //   this.eventEmitter.once('error_exit', reject);
    // });
  }

  async isAuthenticated() {
    return true;
  }

  async userInfo() {
    return {
      username: '',
      email: '',
    };
  }

  async signUp(_: SignUpRequest) {
    return;
  }

  async confirmSignUp(_: ConfirmSignUpRequest) {
    return;
  }

  async signIn(_: SignInRequest) {
    return;
  }

  async signOut() {
    return;
  }

  async forgotPassword(_: ForgotPasswordRequest) {
    return;
  }

  async confirmForgotPassword(_: ConfirmForgotPasswordRequest) {
    return;
  }

  async analyzeImage(image: string) {
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
    }
    await fs.writeFile(inputPath, image);
    if (!this.pythonProcess) {
      await this.startDocAnalysisProcess();
    }
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
    this.stopTimer = setTimeout(() => {
      logger.info('Stopping doc analysis process');
      this.pythonProcess.stdin.write('exit\n');
      this.pythonProcess.stdin.end();
      this.pythonProcess = null;
    }, 5000);
    return JSON.parse(data) as DocumentTextDetectionData;
  }
}
