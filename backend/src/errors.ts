import { ErrorCode, type ErrorCodeType } from '@marketplace/shared';

const httpStatusMap: Record<ErrorCodeType, number> = {
  [ErrorCode.VALIDATION_ERROR]: 422,
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.PHONE_VERIFICATION_REQUIRED]: 403,
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 409,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.INVALID_TOKEN]: 401,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.OTP_INVALID]: 422,
  [ErrorCode.OTP_EXPIRED]: 422,
  [ErrorCode.OTP_RATE_LIMITED]: 429,
  [ErrorCode.PASSWORD_TOO_WEAK]: 422,
  [ErrorCode.RESOURCE_CONFLICT]: 409,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly httpStatus: number;

  constructor(code: ErrorCodeType, message?: string) {
    super(message || code);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = httpStatusMap[code] || 500;
  }

  static validation(message: string) {
    return new AppError(ErrorCode.VALIDATION_ERROR, message);
  }

  static unauthorized(message?: string) {
    return new AppError(ErrorCode.UNAUTHORIZED, message || 'Unauthorized');
  }

  static forbidden(message?: string) {
    return new AppError(ErrorCode.FORBIDDEN, message || 'Forbidden');
  }

  static notFound(message?: string) {
    return new AppError(ErrorCode.NOT_FOUND, message || 'Resource not found');
  }

  static rateLimited(message?: string) {
    return new AppError(ErrorCode.RATE_LIMITED, message || 'Too many requests');
  }

  static phoneVerificationRequired(message?: string) {
    return new AppError(ErrorCode.PHONE_VERIFICATION_REQUIRED, message || 'Phone verification required');
  }

  static emailAlreadyExists(message?: string) {
    return new AppError(ErrorCode.EMAIL_ALREADY_EXISTS, message || 'Email already exists');
  }

  static invalidCredentials(message?: string) {
    return new AppError(ErrorCode.INVALID_CREDENTIALS, message || 'Invalid email or password');
  }

  static invalidToken(message?: string) {
    return new AppError(ErrorCode.INVALID_TOKEN, message || 'Invalid token');
  }

  static tokenExpired(message?: string) {
    return new AppError(ErrorCode.TOKEN_EXPIRED, message || 'Token expired');
  }

  static otpInvalid(message?: string) {
    return new AppError(ErrorCode.OTP_INVALID, message || 'Invalid OTP code');
  }

  static otpExpired(message?: string) {
    return new AppError(ErrorCode.OTP_EXPIRED, message || 'OTP code expired');
  }

  static passwordTooWeak(message?: string) {
    return new AppError(ErrorCode.PASSWORD_TOO_WEAK, message || 'Password is too weak');
  }

  static resourceConflict(message?: string) {
    return new AppError(ErrorCode.RESOURCE_CONFLICT, message || 'Resource conflict');
  }

  static internal(message?: string) {
    return new AppError(ErrorCode.INTERNAL_ERROR, message || 'Internal server error');
  }
}

export function getHttpStatus(code: ErrorCodeType): number {
  return httpStatusMap[code] || 500;
}
