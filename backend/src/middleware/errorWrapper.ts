import type { MiddlewareHandler } from 'hono';
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
      console.error('[errorWrapper] unhandled:', err);
      return c.json(
        { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
        500,
      );
    }
  };
}