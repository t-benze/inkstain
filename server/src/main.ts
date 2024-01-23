import Koa from 'koa';
import Router from 'koa-router';
import { documentRoutes } from './handlers/documents';

const app = new Koa();
const router = new Router();

// Register document routes
documentRoutes(router);

// Apply the routes to the application
app.use(router.routes()).use(router.allowedMethods());

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
