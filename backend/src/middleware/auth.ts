import type { Context, Next } from 'hono';
import { jwtVerify } from 'jose';
import { authConfig } from '../config/auth.js';

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'dealer' | 'agency' | 'store' | 'workshop' | 'admin';
  phoneVerified: boolean;
  emailVerified: boolean;
}

const ROLES = ['user', 'dealer', 'agency', 'store', 'workshop', 'admin'] as const;

export function auth(...allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, authConfig.secret);
      const user = payload as unknown as AuthUser;
      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return c.json({ error: 'Forbidden' }, 403);
      }
      c.set('user', user);
      await next();
    } catch {
      return c.json({ error: 'Invalid token' }, 401);
    }
  };
}

export function optionalAuth() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const { payload } = await jwtVerify(token, authConfig.secret);
        c.set('user', payload as unknown as AuthUser);
      } catch {
        // ignore invalid token
      }
    }
    await next();
  };
}
