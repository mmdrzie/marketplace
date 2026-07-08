import type { Context, MiddlewareHandler } from 'hono';
import { jwtVerify } from 'jose';
import { authConfig } from '../config/auth';
import { AppError } from '../errors';

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
      throw AppError.unauthorized('Missing or invalid Authorization header');
    }

    const token = header.slice(7);
    try {
      const { payload } = await jwtVerify(token, authConfig.secret);
      c.set('user', payload as unknown as AuthUser);
      await next();
    } catch (err) {
      if (err instanceof Error && err.name === 'JWTExpired') {
        throw AppError.tokenExpired();
      }
      throw AppError.invalidToken();
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
