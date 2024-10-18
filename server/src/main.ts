import Koa, { HttpError } from 'koa';
import Router from '@koa/router';
import path from 'path';
import fs from 'fs/promises';
import YAML from 'js-yaml';
import mount from 'koa-mount';
import serve from 'koa-static';
import send from 'koa-send';
import { host, port, sqlitePath } from './settings';
import logger from './logger';
import bodyParser from 'koa-bodyparser';
import AJV from 'ajv';
// @ts-expect-error swagger-ui-dist is not typed
import swaggerUi from 'swagger-ui-dist';
import { Sequelize } from 'sequelize';
import { SpaceService } from './services/SpaceService';
import { DocumentSearchService } from './services/DocumentSearchService';
import { TaskService } from './services/TaskService';
import { AuthService } from './services/AuthService';
import { IntelligenceService } from './services/IntelligenceService';
import { ImageService } from './services/ImageService';
import { PDFService } from './services/PDFService';
import { FileService } from './services/FileService';
import { initDB } from './db';
import { Context } from './types';
import { registerRoutes } from './handlers';
import { AWSProxy } from './proxy/AWSProxy';
import { LocalProxy } from './proxy/LocalProxy';
const app = new Koa<Koa.DefaultState, Context>();

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const contentLength = ctx.response.length || '-';
  logger.http(
    `${ctx.method} ${ctx.url} - ${ctx.status} - ${contentLength} - ${ms}ms`
  );
});

app.use(
  mount('/swagger', async (ctx) => {
    if (ctx.path === '/') {
      // Redirect to `index.html` when path is '/'
      ctx.redirect('/swagger/index.html');
      return;
    }
    if (ctx.path === '/swagger-initializer.js') {
      // ctx.body = indexContent;
      const indexContent = await fs.readFile(
        path.join(swaggerUi.getAbsoluteFSPath(), 'swagger-initializer.js')
      );
      ctx.body = indexContent
        .toString()
        .replace(
          'https://petstore.swagger.io/v2/swagger.json',
          `http://${host}:${port}/swagger/api-docs`
        );
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

app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/assets')) {
    await send(ctx, ctx.path, { root: path.join(__dirname, '../') });
  } else if (ctx.path.startsWith('/api')) {
    await next();
  } else if (ctx.path.startsWith('/static')) {
    await send(ctx, ctx.path.replace('/static', ''), {
      root: path.join(__dirname, '../../web-frontend'),
    });
  } else {
    await send(ctx, 'index.html', {
      root: path.join(__dirname, '../../web-frontend'),
    });
  }
});
// Middleware to handle JSON requests
app.use(
  bodyParser({
    enableTypes: ['json', 'text'],
  })
);

/**
 * common api error handling
 */
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof Error) {
      if (err instanceof HttpError) {
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = {
          message: err.message || 'Internal server error',
          error: err.code,
        };
      }
      ctx.app.emit('error', err, ctx);
    } else {
      ctx.status = 500;
      ctx.body = {
        message: 'Internal server error',
      };
      ctx.app.emit('error', new Error(`Internal server error: ${err}`), ctx);
    }
  }
});

app.on('error', (err: Error, ctx: Context) => {
  logger.error({
    method: ctx.request.method,
    url: ctx.request.url,
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});

const router = new Router({
  prefix: '/api/v1',
});

// Register routes
registerRoutes(router);

// Apply the routes to the application
app.use(router.routes()).use(router.allowedMethods());

const openApiSpecPath = path.resolve(__dirname, '../assets/openapi.yml');

async function start() {
  const schemaContent = await fs.readFile(
    path.resolve(__dirname, '../assets/schema/components.yml'),
    'utf8'
  );
  const validator = new AJV();
  const schema = YAML.load(schemaContent) as {
    components: {
      schemas: { [key: string]: object };
    };
  };
  Object.keys(schema.components.schemas).forEach((key) => {
    validator.addSchema(schema.components.schemas[key], key);
  });
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
    logging: false,
  });
  await sequelize.authenticate();
  await initDB(sequelize);
  app.context.validator = validator;
  app.context.spaceService = new SpaceService();
  app.context.documentService = new DocumentSearchService(
    sequelize,
    app.context.spaceService
  );
  app.context.taskService = new TaskService();
  // const proxy = new AWSProxy();
  const proxy = new LocalProxy();
  app.context.authService = new AuthService(proxy);
  app.context.pdfService = new PDFService();
  app.context.imageService = new ImageService();
  app.context.intelligenceService = new IntelligenceService(
    app.context.spaceService,
    app.context.taskService,
    app.context.pdfService,
    app.context.imageService,
    proxy
  );
  app.context.fileService = new FileService(app.context.spaceService);
  app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
  });
  process.on('SIGINT', () => {
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    process.exit(0);
  });
}

start();
