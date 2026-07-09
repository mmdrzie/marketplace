import type { MiddlewareHandler } from 'hono';
import { AppError } from '../errors.js';

export function phoneGate(): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get('user');
    if (!user || !user.phoneVerified) {
      throw AppError.phoneVerificationRequired();
    }
    await next();
  };
}
