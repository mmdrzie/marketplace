import type { Context, MiddlewareHandler } from 'hono';
import { ErrorCode } from '../shared';
import { rateLimits } from '../config/rateLimits';

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

function getKey(name: string, identifier: string): string {
  return `${name}:${identifier}`;
}

export function rateLimiter(name: string): MiddlewareHandler {
  return async (c, next) => {
    const config = rateLimits[name];
    if (!config) {
      await next();
      return;
    }

    const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const key = getKey(name, ip);
    const now = Date.now();
    const entry = store[key];

    if (!entry || now > entry.resetAt) {
      store[key] = { count: 1, resetAt: now + config.window * 1000 };
      await next();
      return;
    }

    if (entry.count >= config.limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.res.headers.set('Retry-After', String(retryAfter));
      return c.json(
        {
          success: false,
          error: { code: ErrorCode.RATE_LIMITED, message: `Rate limit exceeded. Try again in ${retryAfter}s` },
        },
        429,
      );
    }

    entry.count++;
    await next();
  };
}
