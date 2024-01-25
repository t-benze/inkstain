import fs from 'fs/promises';
import path from 'path';
import * as settings from '~/server/settings';

interface Spaces {
  [name: string]: { path: string };
}

class SpaceService {
  private spaceFilePath: string;

  constructor() {
    this.spaceFilePath = path.join(settings.directories.dataDir, 'spaces.json');
  }

  public async getSpaces(): Promise<Spaces> {
    try {
      const data = await fs.readFile(this.spaceFilePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File not found, return an empty object
        return {};
      } else {
        throw error;
      }
    }
  }

  public async saveSpaces(spaces: Spaces): Promise<void> {
    const data = JSON.stringify(spaces, null, 2);
    await fs.writeFile(this.spaceFilePath, data, 'utf-8');
  }

  public async createSpace(name: string, spacePath: string): Promise<void> {
    const spaces = await this.getSpaces();
    if (spaces[name]) {
      throw new Error(`Space with name '${name}' already exists.`);
    }
    spaces[name] = { path: spacePath };
    await this.saveSpaces(spaces);
  }

  public async updateSpace(name: string, newName: string): Promise<void> {
    const spaces = await this.getSpaces();
    if (!spaces[name]) {
      throw new Error(`Space with name '${name}' does not exist.`);
    }
    spaces[newName] = spaces[name];
    delete spaces[name];
    await this.saveSpaces(spaces);
  }

  public async deleteSpace(name: string): Promise<void> {
    const spaces = await this.getSpaces();
    if (!spaces[name]) {
      throw new Error(`Space with name '${name}' does not exist.`);
    }
    delete spaces[name];
    await this.saveSpaces(spaces);
  }

  // Optionally add other methods that read individual spaces, check space existence, etc.
}

const spaceService = new SpaceService();
export default spaceService;
