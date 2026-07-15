import type { MiddlewareHandler } from 'hono';
import { randomUUID } from 'node:crypto';

export function requestId(): MiddlewareHandler {
  return async (c, next) => {
    const id = c.req.header('X-Request-Id') || randomUUID();
    c.set('requestId', id);
    await next();
    c.res.headers.set('X-Request-Id', id);
  };
}
