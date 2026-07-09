import type { Context, MiddlewareHandler } from 'hono';
import { AppError, getHttpStatus } from '../errors';
import { ErrorCode } from '../shared';

export function errorHandler(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } catch (err) {
      if (err instanceof AppError) {
        c.status(err.httpStatus as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500);
        return c.json({
          success: false,
          error: { code: err.code, message: err.message },
        });
      }

      if (err instanceof SyntaxError) {
        c.status(422);
        return c.json({
          success: false,
          error: { code: ErrorCode.VALIDATION_ERROR, message: 'Invalid JSON body' },
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
