import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';
import path from 'path';
import os from 'os';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import webpackConfig from './cypress/webpack.component.config';

const testSpacePath = path.join(__dirname, 'cypress', 'testSpace');
const runtimePath =
  os.platform() == 'win32'
    ? process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local')
    : path.join(os.homedir(), '.local');
const runtimeDataFolder = path.join(runtimePath, 'inkstain', 'data');

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
  screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/screenshots',

  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: false,
    json: true,
  },

  viewportWidth: 1440,
  viewportHeight: 1024,

  retries: {
    runMode: 2,
    openMode: 0,
  },

  env: {
    TEST_SPACE: testSpacePath,
    RUNTIME_DATA_FOLDER: runtimeDataFolder,
  },

  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    baseUrl: 'http://localhost:6060',
    setupNodeEvents(on, config) {
      on('before:run', async () => {
        try {
          await fs.rmdir(path.join(config.projectRoot, 'cypress', 'results'), {
            recursive: true,
          });
        } catch (e) {
          /* empty */
        }
        try {
          await fs.rmdir(
            path.join(config.projectRoot, 'cypress', 'testSpace'),
            {
              recursive: true,
            }
          );
        } catch (e) {
          /* empty */
        }

        await fs.writeFile(
          path.join(runtimeDataFolder, 'spaces.test.json'),
          '{}',
          'utf-8'
        );
        // await fs.rm(path.join(runtimeDataFolder, 'inkstain.test.sqlite') );
        // set up folder for testing import existing inkstain folder
        await copyDirectory(
          path.join(__dirname, 'cypress', 'fixtures', 'test-space'),
          path.join(testSpacePath, 'My Test Space For Importing')
        );

        // set up an existing space for document testing
        const spaceName = 'My Test Space For Document';
        const targetPath = path.join(testSpacePath, spaceName);
        try {
          await fs.rmdir(targetPath, { recursive: true });
        } catch (e) {
          /* empty */
        }
        await copyDirectory(
          path.join(__dirname, 'cypress', 'fixtures', 'test-space'),
          targetPath
        );
        const meta = await fs.readFile(
          path.join(targetPath, 'ink-space.json'),
          'utf-8'
        );
        const spaceMeta = JSON.parse(meta);
        spaceMeta.name = spaceName;
        await fs.writeFile(
          path.join(targetPath, 'ink-space.json'),
          JSON.stringify(spaceMeta),
          'utf-8'
        );
        const createSpaceResponse = await fetch(
          config.baseUrl + '/api/v1/spaces?type=inkstain',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path: targetPath,
            }),
          }
        );

        if (
          createSpaceResponse.status !== 201 &&
          createSpaceResponse.status !== 400
        )
          throw new Error('Failed to import test space');
      });

      on('task', {
        async 'platform:get'() {
          const response = await fetch(
            config.baseUrl + '/api/v1/system/platform'
          );
          return response.json();
        },
      });
    },
  },

  component: {
    specPattern: [
      'lib/components/**/*.cy.ts?(x)',
      'web-frontend/src/components/**/*.cy.ts?(x)',
    ],
    supportFile: 'cypress/support/component.ts',
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: webpackConfig,
    },
  },
});
