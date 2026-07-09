import type { Context, MiddlewareHandler } from 'hono';
import { ErrorCode } from '../shared/index.js';

export function errorHandler(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } catch (err: any) {
      const isAppError = err && typeof err === 'object' && err.constructor?.name === 'AppError';

      if (isAppError) {
        c.status(err.httpStatus || 500);
        return c.json({
          success: false,
          error: { code: err.code || ErrorCode.INTERNAL_ERROR, message: err.message },
        });
      }

      console.error('[error] unhandled:', err);
      c.status(500);
      return c.json({
        success: false,
        error: { code: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' },
      });
    }
  };
}
