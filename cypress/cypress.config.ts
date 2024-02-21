import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';

const testSpacePath = path.join(__dirname, 'testSpace');
const runtimePath =
  os.platform() == 'win32'
    ? process.env.LOCALAPPDATA
    : path.join(os.homedir(), '.local');
const runtimeDataFolder = path.join(runtimePath, 'inkstain', 'data');
const baseUrl = 'http://localhost:6060';

async function copyDirectory(source, destination) {
  await fs.mkdir(destination, { recursive: true });

  const files = await fs.readdir(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);

    const stats = await fs.stat(sourcePath);

    if (stats.isDirectory()) {
      await copyDirectory(sourcePath, destinationPath);
    } else if (stats.isFile()) {
      await fs.copyFile(sourcePath, destinationPath);
    }
  }
}

export default defineConfig({
  reporter: '../node_modules/mochawesome',
  reporterOptions: {
    reportDir: 'results',
    overwrite: false,
    html: false,
    json: true,
  },
  env: {
    TEST_SPACE: testSpacePath,
    RUNTIME_DATA_FOLDER: runtimeDataFolder,
  },
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'src' }),
    baseUrl,
    setupNodeEvents(on, config) {
      on('before:run', async () => {
        try {
          await fs.rmdir(path.join(config.projectRoot, 'results'), {
            recursive: true,
          });
        } catch (e) {
          /* empty */
        }
        try {
          await fs.rmdir(path.join(config.projectRoot, 'testSpace'), {
            recursive: true,
          });
        } catch (e) {
          /* empty */
        }
        await fs.writeFile(
          path.join(runtimeDataFolder, 'spaces.test.json'),
          '{}',
          'utf-8'
        );
        return null;
      });

      on('task', {
        async 'platform:get'() {
          const response = await fetch(baseUrl + '/api/v1/platform');
          return response.json();
        },
        async 'spaces:seed'() {
          const name = 'My Test Space For Document';
          const platformResponse = await fetch(baseUrl + '/api/v1/platform');
          const platformData = await platformResponse.json();
          const targetPath = testSpacePath + platformData.pathSep + name;

          const createSpaceResponse = await fetch(baseUrl + '/api/v1/spaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: name,
              path: targetPath,
            }),
          });

          if (createSpaceResponse.status !== 201)
            throw new Error('Failed to create space');

          await copyDirectory(
            path.join(__dirname, 'src', 'fixtures', 'test-space-for-documents'),
            targetPath
          );
          return null;
        },
      });
    },
  },
});
