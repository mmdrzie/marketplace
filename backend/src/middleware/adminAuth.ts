import type { MiddlewareHandler } from 'hono';
import { AppError } from '../errors';

export function adminAuth(): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get('user');
    if (!user || user.role !== 'admin') {
      throw AppError.forbidden('Admin access required');
    }
    await next();
  };
}
