import Router from '@koa/router';
import { Context } from '~/server/types';
import cors from '@koa/cors';

const staticProxy = async (ctx: Context) => {
  const query = ctx.request.query;
  const targetUrl = query.url as string;
  const responseType = query.responseType as string;

  if (!targetUrl) {
    ctx.throw(400, 'Missing target URL');
  }

  const response = await fetch(targetUrl);
  const contentType =
    response.headers.get('Content-Type') || 'application/octet-stream';

  if (responseType === 'text') {
    // For text responseType, convert to data URL
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    ctx.body = dataUrl;
    ctx.set('Content-Type', 'text/plain');
    ctx.set('Content-Length', Buffer.byteLength(dataUrl).toString());
  } else {
    // For blob responseType (default), stream the response
    ctx.set('Content-Type', contentType);
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      ctx.set('Content-Length', contentLength);
    }
    // ctx.body = Readable.from(response.body);
    ctx.body = response.body;
  }
};

export const registerProxyRoutes = (router: Router) => {
  router.get('/proxy/static', cors(), staticProxy);
};
