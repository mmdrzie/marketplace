import type { Context, MiddlewareHandler } from 'hono';
import { ErrorCode } from '../shared/index.js';

export function errorHandler(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } catch (err: unknown) {
      const isAppError = err && typeof err === 'object' && err.constructor?.name === 'AppError';

      if (isAppError) {
        const appErr = err as { httpStatus?: number; code?: string; message: string };
        c.status((appErr.httpStatus || 500) as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500);
        return c.json({
          success: false,
          error: { code: appErr.code || ErrorCode.INTERNAL_ERROR, message: appErr.message },
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
