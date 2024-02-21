import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import * as settings from '~/server/settings';
import logger from '../logger';

interface Space {
  key: string;
  name: string;
  path: string;
}

export enum ErrorCode {
  SPACE_ALREADY_EXISTS,
  SPACE_DOES_NOT_EXIST,
}
export class SpaceServiceError extends Error {
  constructor(message: string, public code?: ErrorCode) {
    super(message);
    this.name = 'SpaceServiceError';
  }

  static SPACE_EXISTS = new SpaceServiceError(
    'Space with name already exists.'
  );
}

class SpaceService {
  public async loadSpaceData() {
    try {
      await fs.access(settings.spaceDataFile);
    } catch (err) {
      //create the space data file with empty object if it doesn't exists
      await fs.writeFile(settings.spaceDataFile, '{}', 'utf-8');
    }
    try {
      const fileContent = await fs.readFile(settings.spaceDataFile, 'utf-8');
      const data = JSON.parse(fileContent) as { [key: string]: Space };
      return data;
    } catch (error) {
      logger.error(error.message);
      throw error;
    }
  }

  public async saveSpaceData(spaces: { [key: string]: Space }): Promise<void> {
    const data = JSON.stringify(spaces, null, 2);
    await fs.writeFile(settings.spaceDataFile, data, 'utf-8');
  }

  public async createSpace({ name, path: spacePath }: Space) {
    const spaces = await this.loadSpaceData();
    const key = crypto
      .createHash('sha256')
      .update(name)
      .digest('hex')
      .slice(0, 8);
    if (spaces[key]) {
      console.log('space data', JSON.stringify(spaces, null, 2));
      throw new SpaceServiceError(
        `Space with name ${name} already exists.`,
        ErrorCode.SPACE_ALREADY_EXISTS
      );
    }
    spaces[key] = { name, key, path: spacePath };
    await this.saveSpaceData(spaces);
    // Create the directory on the filesystem
    await fs.mkdir(spacePath, { recursive: true });
    // write an .inkstain file to indicate the folder is an inkstain space
    await fs.writeFile(
      path.join(spacePath, '.inkstain'),
      JSON.stringify({
        name,
      }),
      'utf-8'
    );
    logger.info(`Space created: ${name}`);
  }

  public async updateSpace(key: string, data: Partial<Space>) {
    const spaces = await this.loadSpaceData();
    if (!spaces[key]) {
      throw new SpaceServiceError(
        'Space does not exist.',
        ErrorCode.SPACE_DOES_NOT_EXIST
      );
    }
    spaces[key] = {
      ...spaces[key],
      ...data,
    };
    await this.saveSpaceData(spaces);
  }

  public async deleteSpace(key: string) {
    const spaces = await this.loadSpaceData();
    if (!spaces[key]) {
      throw new SpaceServiceError(
        'Space does not exist.',
        ErrorCode.SPACE_DOES_NOT_EXIST
      );
    }
    delete spaces[key];
    await this.saveSpaceData(spaces);
  }
}

const spaceService = new SpaceService();
export default spaceService;
