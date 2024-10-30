import path from 'path';
import fs from 'fs/promises';
import { existsSync, createReadStream } from 'fs';
import { Space } from '~/server/types';
import { SpaceService } from './SpaceService';
import multer, { File } from '@koa/multer';
import archiver from 'archiver';
import { PassThrough } from 'stream';
/**
 * Zips the contents of the specified folder and returns a buffer.
 * @param folderPath - The path of the folder to zip.
 * @returns A promise that resolves with the zip buffer.
 */
const zipFolder = (folderPath: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Sets the compression level.
    });

    const buffers: Buffer[] = [];
    const passthrough = new PassThrough();

    passthrough.on('data', (chunk) => buffers.push(chunk));
    passthrough.on('end', () => resolve(Buffer.concat(buffers)));
    passthrough.on('error', (err) => reject(err));

    archive.on('error', (err) => reject(err));

    archive.pipe(passthrough);

    // Append files from the directory
    archive.directory(folderPath, false);

    // Finalize the archive (i.e., we are done appending files but streams have to finish yet)
    archive.finalize();
  });
};
class FileManager {
  constructor(public readonly space: Space) {}

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

  async addDocument(documentPath: string, file: File) {
    const ext = path.extname(file.originalname);
    const documentDirectory = documentPath + '.ink';
    const realPath = path.join(this.space.path, documentDirectory);
    // Create target directory
    await fs.mkdir(realPath, { recursive: true });
    // Write file content
    const contentPath = path.join(realPath, `content${ext}`);
    await fs.writeFile(contentPath, file.buffer);
    // Write metadata json
    const metadata = {
      mimetype: file.mimetype,
      attributes: {
        title: file.originalname.replace(ext, ''),
      },
    };
    await this.writeMetaFile(documentPath, JSON.stringify(metadata, null, 2));
    return await fs.writeFile(contentPath, file.buffer);
  }

  async removeDocument(documentPath: string) {
    const documentDirectory = documentPath + '.ink';
    const filePath = path.join(this.space.path, documentDirectory);
    await fs.rm(filePath, { recursive: true, force: true });
  }

  async addFolder(documentPath: string) {
    const documentDirectory = documentPath;
    const filePath = path.join(this.space.path, documentDirectory);
    await fs.mkdir(filePath, { recursive: true });
  }

  async removeFolder(documentPath: string) {
    const documentDirectory = documentPath;
    const filePath = path.join(this.space.path, documentDirectory);
    await fs.rm(filePath, { recursive: true, force: true });
  }

  async exportDocumentWithData(documentPath: string) {
    const documentDirectory = documentPath + '.ink';
    const filePath = path.join(this.space.path, documentDirectory);
    return await zipFolder(filePath);
  }

  async exportDocument(documentPath: string) {
    const extension = path.extname(documentPath);
    const documentDirectory = documentPath + '.ink';
    const filePath = path.join(this.space.path, documentDirectory);
    return createReadStream(path.join(filePath, `content.${extension}`));
  }

  async importDocument(
    localFilePath: string,
    documentPath: string,
    mimeType: string
  ) {
    const documentDirectory = documentPath + '.ink';
    const realPath = path.join(this.space.path, documentDirectory);
    await fs.mkdir(realPath, { recursive: true });
    const ext = path.extname(localFilePath);
    await fs.rename(localFilePath, path.join(realPath, `content${ext}`));
    const meta = {
      mimetype: mimeType,
      attributes: {},
    };
    await this.writeMetaFile(documentPath, JSON.stringify(meta, null, 2));
  }

  async renameFolder(oldPath: string, newPath: string) {
    const oldRealPath = path.join(this.space.path, oldPath);
    const newRealPath = path.join(this.space.path, newPath);
    await fs.rename(oldRealPath, newRealPath);
    return newPath;
  }

  async renameDocument(oldPath: string, newPath: string) {
    const oldRealPath = path.join(this.space.path, oldPath) + '.ink';
    const newRealPath = path.join(this.space.path, newPath) + '.ink';
    await fs.rename(oldRealPath, newRealPath);
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
    try {
      return await this.readFile(documentPath, 'annotations.json');
    } catch (err) {
      return '[]';
    }
  }

  async writeAnnotationFile(documentPath: string, content: string) {
    return await this.writeFile(documentPath, 'annotations.json', content, {
      encoding: 'utf-8',
    });
  }

  async readMetaFile(documentPath: string) {
    return await this.readFile(documentPath, 'meta.json');
  }

  async writeMetaFile(documentPath: string, content: string) {
    return await this.writeFile(documentPath, 'meta.json', content, {
      encoding: 'utf-8',
    });
  }

  async readDir(documentPath: string) {
    const fullPath = path.join(this.space.path, documentPath);
    const files = await fs.readdir(fullPath);
    const results = files
      .filter((file) => file !== '.inkstain' && file !== '.DS_Store')
      .map(async (file) => {
        const isFile = file.endsWith('.ink');
        file = isFile ? file.slice(0, file.length - 4) : file;
        return {
          name: file,
          type: isFile ? 'file' : 'folder',
          path: path.join(documentPath, file),
        };
      });
    return await Promise.all(results);
  }

  getFolderPath(documentPath: string) {
    const documentDirectory = documentPath;
    return path.join(this.space.path, documentDirectory);
  }

  getDocumentContentPath(documentPath: string) {
    const documentDirectory = documentPath + '.ink';
    const extension = path.extname(documentPath);
    const realPath = path.join(this.space.path, documentDirectory);
    return path.join(realPath, `content${extension}`);
  }

  async traverseFolder(relative: string, documentsToIndex: string[]) {
    const root = this.space.path;
    const targetPath = path.join(root, relative);
    const files = await fs.readdir(targetPath);
    for (const file of files) {
      const fullPath = path.join(targetPath, file);
      const stat = await fs.lstat(fullPath);
      if (stat.isDirectory()) {
        if (file.endsWith('.ink')) {
          const docPath = path.relative(root, fullPath).slice(0, -4);
          documentsToIndex.push(docPath);
        } else {
          this.traverseFolder(path.relative(root, fullPath), documentsToIndex);
        }
      }
    }
  }

  async findDocumentsUnderFolder(folder: string) {
    const documentsToIndex: string[] = [];
    await this.traverseFolder(folder, documentsToIndex);
    return documentsToIndex;
  }
}

export class FileService {
  constructor(private readonly spaceService: SpaceService) {}

  async getFileManager(spaceKey: string) {
    const space = await this.spaceService.getSpace(spaceKey);
    return new FileManager(space);
  }
}
