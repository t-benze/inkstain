import Router from '@koa/router';
import { registerDocumentRoutes } from './documents';
import { registerSpaceRoutes } from './space';
import { registerSystemRoutes } from './system';
import { registerTaskRoutes } from './task';
import { registerIntelligenceRoutes } from './intelligence';
import { registerSearchRoutes } from './search';
import { registerAuthRoutes } from './auth';

export const registerRoutes = (router: Router) => {
  registerDocumentRoutes(router);
  registerSpaceRoutes(router);
  registerSystemRoutes(router);
  registerTaskRoutes(router);
  registerIntelligenceRoutes(router);
  registerSearchRoutes(router);
  registerAuthRoutes(router);
};
