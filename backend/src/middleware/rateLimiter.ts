import type { Context, MiddlewareHandler } from 'hono';
import { ErrorCode } from '../shared/index.js';
import { rateLimits } from '../config/rateLimits.js';

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

const store: RateLimitStore = {};

let sweepCounter = 0;
const SWEEP_EVERY = 1000;
const SWEEP_MIN_KEYS = 1000;

function getKey(name: string, identifier: string): string {
  return `${name}:${identifier}`;
}

function extractClientIp(c: Context): string {
  const forwarded = c.req.header('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp && /^\d{1,3}(\.\d{1,3}){3}$/.test(firstIp)) {
      return firstIp;
    }
  }
  return c.req.header('x-real-ip') || c.req.header('cf-connecting-ip') || 'unknown';
}

function sweepExpired(now: number) {
  if (++sweepCounter < SWEEP_EVERY || Object.keys(store).length < SWEEP_MIN_KEYS) {
    return;
  }
  sweepCounter = 0;
  for (const key of Object.keys(store)) {
    const entry = store[key];
    if (entry && now > entry.resetAt) {
      delete store[key];
    }
  }
}

export function rateLimiter(name: string): MiddlewareHandler {
  return async (c, next) => {
    sweepExpired(Date.now());
    const config = rateLimits[name];
    if (!config) {
      console.warn(`[rateLimiter] No rate limit config found for name "${name}". Skipping rate limit.`);
      await next();
      return;
    }

    const ip = extractClientIp(c);
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
