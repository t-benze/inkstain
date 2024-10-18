import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import * as settings from '~/server/settings';
import logger from '~/server/logger';
import { Space } from '~/server/types';

export enum ErrorCode {
  SPACE_ALREADY_EXISTS = 1,
  SPACE_DOES_NOT_EXIST,
  IMPORT_INVALID_SPACE,
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

function hashName(name: string) {
  return crypto.createHash('sha256').update(name).digest('hex').slice(0, 8);
}

export class SpaceService {
  public async loadSpaceData() {
    try {
      await fs.access(settings.spaceDataFile);
    } catch (err) {
      //create the space data file with empty object if it doesn't exists
      await fs.writeFile(settings.spaceDataFile, '{}', 'utf-8');
    }
    const fileContent = await fs.readFile(settings.spaceDataFile, 'utf-8');
    const data = JSON.parse(fileContent) as { [key: string]: Space };
    return data;
  }

  public async saveSpaceData(spaces: { [key: string]: Space }): Promise<void> {
    const data = JSON.stringify(spaces, null, 2);
    await fs.writeFile(settings.spaceDataFile, data, 'utf-8');
  }

  public async createSpace({
    name,
    path: spacePath,
  }: {
    name: string;
    path: string;
  }) {
    const spaces = await this.loadSpaceData();
    const key = hashName(name);
    if (spaces[key]) {
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
    return spaces[key];
  }

  public async importExistingInkStainSpace(spacePath: string) {
    const inkstainFile = path.join(spacePath, '.inkstain');
    try {
      await fs.access(inkstainFile);
    } catch (err) {
      throw new SpaceServiceError(
        'The directory is not an inkstain space.',
        ErrorCode.IMPORT_INVALID_SPACE
      );
    }
    const fileContent = await fs.readFile(inkstainFile, 'utf-8');
    const metaData = JSON.parse(fileContent);
    const spaceName = metaData.name;
    const key = hashName(spaceName);
    const spaces = await this.loadSpaceData();
    if (spaces[key]) {
      throw new SpaceServiceError(
        `Space with name ${spaceName} already exists.`,
        ErrorCode.SPACE_ALREADY_EXISTS
      );
    }
    spaces[key] = { name: spaceName, key, path: spacePath };
    await this.saveSpaceData(spaces);
    logger.info(`Space imported: ${spaceName}, path: ${spacePath}`);
    return spaces[key];
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

  public async getSpace(key: string) {
    const spaces = await this.loadSpaceData();
    return spaces[key];
  }
}
