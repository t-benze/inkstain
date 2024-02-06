import {
  PlatformApi,
  DocumentsApi,
  SpacesApi,
  Configuration,
} from '@inkstain/client-api';

const config = new Configuration({
  basePath: '/api/v1',
});
export const platformApi = new PlatformApi(config);
export const documentsApi = new DocumentsApi(config);
export const spacesApi = new SpacesApi(config);
