import { describe, it, expect } from 'vitest';
import { AppError, getHttpStatus } from '../src/errors';
import { ErrorCode, type ErrorCodeType } from '@marketplace/shared';

describe('AppError', () => {
  it('creates error with correct code and message', () => {
    const err = AppError.notFound('User not found');
    expect(err.code).toBe(ErrorCode.NOT_FOUND);
    expect(err.message).toBe('User not found');
    expect(err.httpStatus).toBe(404);
  });

  it('maps all error codes to correct HTTP statuses', () => {
    const testCases: [ErrorCodeType, number][] = [
      [ErrorCode.VALIDATION_ERROR, 422],
      [ErrorCode.UNAUTHORIZED, 401],
      [ErrorCode.FORBIDDEN, 403],
      [ErrorCode.NOT_FOUND, 404],
      [ErrorCode.RATE_LIMITED, 429],
      [ErrorCode.PHONE_VERIFICATION_REQUIRED, 403],
      [ErrorCode.EMAIL_ALREADY_EXISTS, 409],
      [ErrorCode.INVALID_CREDENTIALS, 401],
      [ErrorCode.INVALID_TOKEN, 401],
      [ErrorCode.TOKEN_EXPIRED, 401],
      [ErrorCode.OTP_INVALID, 422],
      [ErrorCode.OTP_EXPIRED, 422],
      [ErrorCode.OTP_RATE_LIMITED, 429],
      [ErrorCode.PASSWORD_TOO_WEAK, 422],
      [ErrorCode.RESOURCE_CONFLICT, 409],
      [ErrorCode.INTERNAL_ERROR, 500],
    ];

    for (const [code, expectedStatus] of testCases) {
      const err = new AppError(code);
      expect(err.httpStatus).toBe(expectedStatus);
      expect(getHttpStatus(code)).toBe(expectedStatus);
    }
  });

  it('provides static factory methods', () => {
    expect(AppError.validation('test')).toBeInstanceOf(AppError);
    expect(AppError.unauthorized()).toBeInstanceOf(AppError);
    expect(AppError.forbidden()).toBeInstanceOf(AppError);
    expect(AppError.notFound()).toBeInstanceOf(AppError);
    expect(AppError.rateLimited()).toBeInstanceOf(AppError);
    expect(AppError.phoneVerificationRequired()).toBeInstanceOf(AppError);
    expect(AppError.emailAlreadyExists()).toBeInstanceOf(AppError);
    expect(AppError.invalidCredentials()).toBeInstanceOf(AppError);
    expect(AppError.invalidToken()).toBeInstanceOf(AppError);
    expect(AppError.tokenExpired()).toBeInstanceOf(AppError);
    expect(AppError.otpInvalid()).toBeInstanceOf(AppError);
    expect(AppError.otpExpired()).toBeInstanceOf(AppError);
    expect(AppError.passwordTooWeak()).toBeInstanceOf(AppError);
    expect(AppError.resourceConflict()).toBeInstanceOf(AppError);
    expect(AppError.internal()).toBeInstanceOf(AppError);
  });

  it('uses code as default message when not provided', () => {
    const err = AppError.notFound();
    expect(err.message).toBe('Resource not found');
  });
});
