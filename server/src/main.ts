import Koa from 'koa';
import Router from 'koa-router';
import path from 'path';
import fs from 'fs/promises';
import YAML from 'js-yaml';
import mount from 'koa-mount';
import serve from 'koa-static';
import send from 'koa-send';
import swaggerUi from 'swagger-ui-dist';
import { host, port } from './settings';
import logger from './logger';
import bodyParser from 'koa-bodyparser';
import { registerDocumentRoutes } from './handlers/documents';
import { registerSpaceRoutes } from './handlers/space';
import { registerPlatformRoutes } from './handlers/platform';
const app = new Koa();

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const contentLength = ctx.response.length || '-';
  logger.http(
    `${ctx.method} ${ctx.url} - ${ctx.status} - ${contentLength} - ${ms}ms`
  );
});
app.use(async (ctx, next) => {
  // If the request does not match a static file, serve the main HTML file
  if (ctx.path.startsWith('/assets')) {
    await send(ctx, ctx.path, { root: path.join(__dirname, '../../') });
  } else if (ctx.path.startsWith('/api')) {
    await next();
  } else if (ctx.path.startsWith('/static')) {
    await send(ctx, ctx.path.replace('/static', ''), {
      root: path.join(__dirname, '../../../web-frontend'),
    });
  } else {
    await send(ctx, 'index.html', {
      root: path.join(__dirname, '../../../web-frontend'),
    });
  }
});
// Middleware to handle JSON requests
app.use(
  bodyParser({
    enableTypes: ['json', 'text'],
  })
);

const router = new Router({
  prefix: '/api/v1',
});

// Register document routes
registerDocumentRoutes(router);
registerSpaceRoutes(router);
registerPlatformRoutes(router);

// Apply the routes to the application
app.use(router.routes()).use(router.allowedMethods());

const openApiSpecPath = path.join(
  __dirname,
  '..',
  '..',
  'assets',
  'openapi.yml'
);

app.use(
  mount('/swagger', async (ctx) => {
    if (ctx.path === '/') {
      // Redirect to `index.html` when path is '/'
      ctx.redirect('/swagger/index.html');
      return;
    }
    if (ctx.path === '/swagger-initializer.js') {
      // ctx.body = indexContent;
      const indexContent = await fs
        .readFile(
          path.join(swaggerUi.getAbsoluteFSPath(), 'swagger-initializer.js')
        )
        .toString()
        .replace(
          'https://petstore.swagger.io/v2/swagger.json',
          `http://${host}:${port}/swagger/api-docs`
        );
      ctx.body = indexContent;
      return;
    }

    if (ctx.path === '/api-docs') {
      // Serve the OpenAPI spec
      ctx.response.set('Content-Type', 'application/json');
      const spec = await fs.readFile(openApiSpecPath, 'utf8');
      const swaggerDocument = YAML.load(spec);
      ctx.body = swaggerDocument;
      return;
    }

    // Serve Swagger UI's other assets (CSS, JS, etc.) by Koa Static
    await serve(swaggerUi.getAbsoluteFSPath())(ctx, () => Promise.resolve());
  })
);

// Start the server
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
