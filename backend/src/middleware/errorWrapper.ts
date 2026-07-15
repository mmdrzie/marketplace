import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ErrorCode } from '../shared/index.js';

export function errorWrapper(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && 'httpStatus' in err) {
        const appErr = err as { code: string; httpStatus: number; message: string };
        return c.json(
          { success: false, error: { code: appErr.code, message: appErr.message } },
          appErr.httpStatus as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500,
        );
      }

      if (err instanceof HTTPException) {
        return c.json(
          { success: false, error: { code: ErrorCode.VALIDATION_ERROR, message: err.message } },
          err.status,
        );
      }

      if (err instanceof SyntaxError) {
        return c.json(
          { success: false, error: { code: ErrorCode.VALIDATION_ERROR, message: 'Invalid JSON body' } },
          400,
        );
      }

      console.error('[errorWrapper] unhandled:', err);
      return c.json(
        { success: false, error: { code: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' } },
        500,
      );
    }
  };
}