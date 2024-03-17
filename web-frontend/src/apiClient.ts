import {
  PlatformApi,
  DocumentsApi,
  SpacesApi,
  Configuration,
} from '@inkstain/client-api';

export const API_PREFIX = '/api/v1';
const config = new Configuration({
  basePath: API_PREFIX,
});
export const platformApi = new PlatformApi(config);
export const documentsApi = new DocumentsApi(config);
export const spacesApi = new SpacesApi(config);
