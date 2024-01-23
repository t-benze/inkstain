import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';

dotenv.config();
export const env = process.env.NODE_ENV; // 'development' or 'production'
export const host = process.env.HOST ?? 'localhost';
export const port = process.env.PORT ? Number(process.env.PORT) : 3000;

let directories: {
  configDir: string;
  dataDir: string;
  cacheDir: string;
  stateDir: string;
}
;

if (os.platform() === 'win32') {
  // Windows Directories
  directories = {
    configDir:
      process.env.APPDATA ||
      path.join(os.homedir(), 'AppData', 'Roaming', 'inkstain'),
    dataDir:
      process.env.LOCALAPPDATA ||
      path.join(os.homedir(), 'AppData', 'Local', 'inkstain'),
    cacheDir:
      process.env.TEMP ||
      path.join(os.homedir(), 'AppData', 'Local', 'Temp', 'inkstain'),
    stateDir:
      process.env.LOCALAPPDATA ||
      path.join(os.homedir(), 'AppData', 'Local', 'inkstain'),
  };
} else {
  // XDG Base Directories
  directories = {
    configDir:
      process.env.XDG_CONFIG_HOME ||
      path.join(os.homedir(), '.config', 'inkstain'),
    dataDir:
      process.env.XDG_DATA_HOME ||
      path.join(os.homedir(), '.local', 'share', 'inkstain'),
    cacheDir:
      process.env.XDG_CACHE_HOME ||
      path.join(os.homedir(), '.cache', 'inkstain'),
    stateDir:
      process.env.XDG_STATE_HOME ||
      path.join(os.homedir(), '.local', 'state', 'inkstain'),
  };
}

// Create directories if they don't exist
fs.mkdirSync(directories.configDir, { recursive: true });
fs.mkdirSync(directories.dataDir, { recursive: true });
fs.mkdirSync(directories.cacheDir, { recursive: true });
fs.mkdirSync(directories.stateDir, { recursive: true });

export { directories }  ;
