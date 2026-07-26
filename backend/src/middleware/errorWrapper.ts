import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ErrorCode } from '../shared/index.js';
import type { DomainError } from '../domain/errors/DomainError.js';

const DOMAIN_HTTP_STATUS: Record<string, number> = {
  CONVERSATION_NOT_FOUND: 404,
  MESSAGE_NOT_FOUND: 404,
  CONVERSATION_LOCKED: 423,
  CONVERSATION_DELETED: 410,
  MESSAGE_DELETED: 410,
  NOT_PARTICIPANT: 403,
  USER_BLOCKED: 403,
  CONVERSATION_NOT_ACTIVE: 422,
  SELF_MESSAGE: 422,
  OPTIMISTIC_LOCK: 409,
  CANNOT_EDIT_DELETED: 422,
  MESSAGE_TOO_LONG: 422,
  EMPTY_MESSAGE: 422,
};

function isDomainError(err: unknown): err is DomainError {
  return (
    err !== null &&
    typeof err === 'object' &&
    'code' in err &&
    typeof (err as DomainError).code === 'string' &&
    !('httpStatus' in err)
  );
}

export function errorWrapper(): MiddlewareHandler {
  return async (c, next) => {
    try {
      await next();
    } catch (err: unknown) {
      if (isDomainError(err)) {
        const httpStatus = DOMAIN_HTTP_STATUS[err.code] || 500;
        return c.json(
          { success: false, error: { code: err.code, message: err.message } },
          httpStatus as 400 | 401 | 403 | 404 | 409 | 410 | 422 | 423 | 429 | 500,
        );
      }

      if (err && typeof err === 'object' && 'code' in err && 'httpStatus' in err) {
        const appErr = err as { code: string; httpStatus: number; message: string };
        return c.json(
          { success: false, error: { code: appErr.code, message: appErr.message } },
          appErr.httpStatus as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500,
        );
      }

      if (err instanceof HTTPException) {
        const code =
          err.status === 401 ? ErrorCode.UNAUTHORIZED
          : err.status === 403 ? ErrorCode.FORBIDDEN
          : err.status === 404 ? ErrorCode.NOT_FOUND
          : err.status === 409 ? ErrorCode.RESOURCE_CONFLICT
          : err.status === 429 ? ErrorCode.RATE_LIMITED
          : err.status === 422 ? ErrorCode.VALIDATION_ERROR
          : ErrorCode.INTERNAL_ERROR;
        return c.json(
          { success: false, error: { code, message: err.message } },
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