import type { MiddlewareHandler } from 'hono';
import { config } from '../config/index.js';

export function corsMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const origin = c.req.header('Origin') || '';
    const allowedOrigins = [config.frontendUrl, 'http://localhost:3000', 'http://localhost:4000'];

    if (allowedOrigins.includes(origin)) {
      c.res.headers.set('Access-Control-Allow-Origin', origin);
      c.res.headers.set('Access-Control-Allow-Credentials', 'true');
      c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      c.res.headers.set('Access-Control-Max-Age', '86400');
    }

    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }

    await next();
  };
}
