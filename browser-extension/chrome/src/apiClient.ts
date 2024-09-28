import {
  TasksApi,
  SystemApi,
  DocumentsApi,
  SpacesApi,
  IntelligenceApi,
  SearchApi,
  Configuration,
} from '@inkstain/client-api';
import { getSettings } from './utils/chrome';

// export const API_PREFIX = 'http://localhost:6060/api/v1';
export const API_PREFIX = '/api/v1';
const config = new Configuration({
  basePath: API_PREFIX,
});
export let systemApi = new SystemApi(config);
export let documentsApi = new DocumentsApi(config);
export let spacesApi = new SpacesApi(config);
export let taskApi = new TasksApi(config);
export let intelligenceApi = new IntelligenceApi(config);
export let searchApi = new SearchApi(config);

export const configureApiClient = () => {
  return new Promise<void>((resolve) => {
    if (chrome.storage && chrome.storage.local) {
      getSettings().then((settings) => {
        const host = `http://${settings.host}:${settings.port}`;
        const hostConfig = new Configuration({
          basePath: host + '/api/v1',
        });
        systemApi = new SystemApi(hostConfig);
        documentsApi = new DocumentsApi(hostConfig);
        spacesApi = new SpacesApi(hostConfig);
        taskApi = new TasksApi(hostConfig);
        intelligenceApi = new IntelligenceApi(hostConfig);
        searchApi = new SearchApi(hostConfig);
        resolve();
      });
    } else {
      resolve();
    }
  });
};
