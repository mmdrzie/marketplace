import { OneTimeToken } from './OneTimeToken.entity.js';

export interface OneTimeTokenRepository {
  create(data: {
    jti: string;
    type: string;
    subject?: string | null;
    metadata?: Record<string, unknown>;
    expiresAt: Date;
  }): Promise<OneTimeToken>;

  /** Atomically consume: only succeeds if unused and unexpired. */
  consume(jti: string, expectedType: string): Promise<OneTimeToken | null>;

  /** Peek without consuming (e.g. for resend before consumption). */
  peek(jti: string, expectedType: string): Promise<OneTimeToken | null>;

  /** Cleanup expired tokens (retention). */
  purgeExpired(): Promise<number>;
}
