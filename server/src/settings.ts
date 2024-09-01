import fs from 'fs';
import path from 'path';
import os from 'os';
import 'dotenv/config';

export const env =
  (process.env.NODE_ENV as 'development' | 'production' | 'test') ??
  'production';
export const host = process.env.HOST ?? 'localhost';
export const port = process.env.PORT ? Number(process.env.PORT) : 6060;

const runtimePath =
  os.platform() == 'win32'
    ? process.env.LOCALAPPDATA
    : path.join(os.homedir(), '.local');

export const directories = {
  configDir: path.join(runtimePath, 'inkstain', 'config'),
  dataDir: path.join(runtimePath, 'inkstain', 'data'),
  cacheDir: path.join(runtimePath, 'inkstain', 'cache'),
  stateDir: path.join(runtimePath, 'inkstain', 'state'),
};

// Create directories if they don't exist
fs.mkdirSync(directories.configDir, { recursive: true });
fs.mkdirSync(directories.dataDir, { recursive: true });
fs.mkdirSync(directories.cacheDir, { recursive: true });
fs.mkdirSync(directories.stateDir, { recursive: true });

export const spaceDataFile = path.join(
  directories.dataDir,
  env == 'production' ? 'spaces.json' : `spaces.${env}.json`
);

export const sqlitePath = path.join(
  directories.dataDir,
  env == 'production' ? 'inkstain.sqlite' : `inkstain.${env}.sqlite`
);

export const cognitoUserPoolId = process.env.AWS_COGNITO_USER_POOL_ID;
export const cognitoUserPoolClientId =
  process.env.AWS_COGNITO_USER_POOL_CLIENT_ID;
export const intelligenceAPIBase = process.env.AWS_INTELLIGENCE_ENDPOINT;
