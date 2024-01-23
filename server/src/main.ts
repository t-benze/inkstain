import Koa from 'koa';
import Router from 'koa-router';
import path from 'path';
import fs from 'fs';
import YAML from 'js-yaml';
import mount from 'koa-mount';
import serve from 'koa-static';

import { host, port } from './settings';


import { documentRoutes } from './handlers/documents';

const app = new Koa();
const router = new Router();

// Register document routes
documentRoutes(router);

// Apply the routes to the application
app.use(router.routes()).use(router.allowedMethods());



const swaggerUi = require('swagger-ui-dist');
const openApiSpecPath = path.join(__dirname, 'openapi.yml');

const indexContent = fs
  .readFileSync(
    path.join(swaggerUi.getAbsoluteFSPath(), 'swagger-initializer.js')
  )
  .toString()
  .replace(
    'https://petstore.swagger.io/v2/swagger.json',
    `http://${host}:${port}/swagger/api-docs`
  );

app.use(
  mount('/swagger', async (ctx) => {
    if (ctx.path === '/') {
      // Redirect to `index.html` when path is '/'
      ctx.redirect('/swagger/index.html');
      return;
    }
    if (ctx.path === '/swagger-initializer.js') {
      ctx.body = indexContent;
      return;
    }

    if (ctx.path === '/api-docs') {
      // Serve the OpenAPI spec
      ctx.response.set('Content-Type', 'application/json');
      const spec = fs.readFileSync(openApiSpecPath, 'utf8');
      const swaggerDocument = YAML.load(spec);
      ctx.body = swaggerDocument;
      return;
    }

    // Serve Swagger UI's other assets (CSS, JS, etc.) by Koa Static
    await serve(swaggerUi.getAbsoluteFSPath())(ctx, () => Promise.resolve());
  })
);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(Number(PORT), host, () => {
  console.log(`Server running on http://${host}:${PORT}`);
});

