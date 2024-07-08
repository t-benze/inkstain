import {
  TasksApi,
  SystemApi,
  DocumentsApi,
  SpacesApi,
  Configuration,
} from '@inkstain/client-api';

export const API_PREFIX = '/api/v1';
const config = new Configuration({
  basePath: API_PREFIX,
});
export const systemApi = new SystemApi(config);
export const documentsApi = new DocumentsApi(config);
export const spacesApi = new SpacesApi(config);
export const taskApi = new TasksApi(config);
