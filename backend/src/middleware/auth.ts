import type { Context, MiddlewareHandler } from 'hono';
import { jwtVerify } from 'jose';
import { authConfig } from '../config/auth.js';
import { AppError } from '../errors.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'dealer' | 'agency' | 'admin';
  phoneVerified: boolean;
  emailVerified: boolean;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

export function auth(): MiddlewareHandler {
  return async (c, next) => {
    const header = c.req.header('Authorization');
    if (!header?.startsWith('Bearer ')) {
      return c.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' } },
        401,
      );
    }

    const token = header.slice(7);
    try {
      const { payload } = await jwtVerify(token, authConfig.secret);
      c.set('user', payload as unknown as AuthUser);
      await next();
    } catch (err) {
      const isExpired = err instanceof Error && err.name === 'JWTExpired';
      return c.json(
        { success: false, error: { code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN', message: isExpired ? 'Token expired' : 'Invalid token' } },
        401,
      );
    }
  };
}

export function optionalAuth(): MiddlewareHandler {
  return async (c, next) => {
    const header = c.req.header('Authorization');
    if (header?.startsWith('Bearer ')) {
      const token = header.slice(7);
      try {
        const { payload } = await jwtVerify(token, authConfig.secret);
        c.set('user', payload as unknown as AuthUser);
      } catch {
        // Ignore invalid tokens for optional auth
      }
    }
    await next();
  };
}
