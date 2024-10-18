import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { Space } from '~/server/types';
import { SpaceService } from './SpaceService';

class FileManager {
  constructor(private readonly space: Space) {}
  async readFile(
    documentPath: string,
    file: string,
    encoding = 'utf-8' as BufferEncoding
  ) {
    const documentDirectory = documentPath + '.ink';
    const filePath = path.join(this.space.path, documentDirectory, file);
    if (!existsSync(filePath)) {
      throw new Error(`File ${filePath} does not exist`);
    } else {
      const content = await fs.readFile(filePath, encoding);
      return content;
    }
  }

  async writeFile(
    documentPath: string,
    file: string,
    content: string,
    options: {
      encoding?: BufferEncoding;
    } = {
      encoding: 'utf-8',
    }
  ) {
    const documentDirectory = documentPath + '.ink';
    const filePath = path.join(this.space.path, documentDirectory, file);
    return await fs.writeFile(filePath, content, options);
  }

  async readAnnotationFile(documentPath: string) {
    return await this.readFile(documentPath, 'annotations.json');
  }

  async writeAnnotationFile(documentPath: string, content: string) {
    return await this.writeFile(documentPath, 'annotations.json', content, {
      encoding: 'utf-8',
    });
  }
}

export class FileService {
  constructor(private readonly spaceService: SpaceService) {}

  async getFileManager(spaceKey: string) {
    const space = await this.spaceService.getSpace(spaceKey);
    return new FileManager(space);
  }
}
