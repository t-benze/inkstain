import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';

dotenv.config();
export const env = process.env.NODE_ENV; // 'development' or 'production'
export const host = process.env.HOST ?? 'localhost';
export const port = process.env.PORT ? Number(process.env.PORT) : 6060;

let directories: {
  configDir: string;
  dataDir: string;
  cacheDir: string;
  stateDir: string;
};

if (os.platform() === 'win32') {
  // Windows Directories
  directories = {
    configDir: path.join(process.env.APPDATA, 'inkstain'),
    dataDir: path.join(process.env.LOCALAPPDATA, 'inkstain'),
    cacheDir: path.join(process.env.TEMP, 'inkstain'),
    stateDir: path.join(process.env.LOCALAPPDATA, 'inkstain'),
  };
} else {
  // XDG Base Directories
  directories = {
    configDir: path.join(os.homedir(), '.config', 'inkstain'),
    dataDir: path.join(os.homedir(), '.local', 'share', 'inkstain'),
    cacheDir: path.join(os.homedir(), '.cache', 'inkstain'),
    stateDir: path.join(os.homedir(), '.local', 'state', 'inkstain'),
  };
}

// Create directories if they don't exist
fs.mkdirSync(directories.configDir, { recursive: true });
fs.mkdirSync(directories.dataDir, { recursive: true });
fs.mkdirSync(directories.cacheDir, { recursive: true });
fs.mkdirSync(directories.stateDir, { recursive: true });

export { directories };
