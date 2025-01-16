import fs from 'fs';
import path from 'path';
import os from 'os';
import 'dotenv/config';

export const env =
  (process.env.NODE_ENV as 'development' | 'production' | 'test') ??
  'production';
export const host = process.env.HOST ?? 'localhost';
export const port = process.env.PORT ? Number(process.env.PORT) : 6060;

const inkstainHomePath =
  process.env['INKSTAIN_RUNTIME_PATH'] ||
  path.join(
    os.platform() == 'win32'
      ? (process.env.LOCALAPPDATA as string)
      : path.join(os.homedir(), '.local'),
    'inkstain'
  );

export const directories = {
  configDir: path.join(inkstainHomePath, 'config'),
  dataDir: path.join(inkstainHomePath, 'data'),
  cacheDir: path.join(inkstainHomePath, 'cache'),
  stateDir: path.join(inkstainHomePath, 'state'),
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

export const tokensFile = path.join(
  directories.stateDir,
  env == 'production' ? 'tokens.json' : `tokens.${env}.json`
);

export const cognitoUserPoolId = 'ap-southeast-1_6VKSJ8wtn';
export const cognitoUserPoolClientId = 'sn3gt148lvl5q3rshs424kdkk';
export const intelligenceAPIBase =
  'https://cc1snaciy0.execute-api.ap-southeast-1.amazonaws.com/prod';

export const analyzeImagePath = path.resolve(
  __dirname,
  '../../doc-intelligence/analyze_doc/analyze_doc'
);
