export interface OneTimeTokenSnapshot {
  jti: string;
  type: string;
  subject: string | null;
  metadata: Record<string, unknown>;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export type OneTimeTokenType = 'oauth_state' | 'oauth_result' | 'oauth_verify' | 'oauth_link';

export class OneTimeToken {
  private constructor(
    public readonly jti: string,
    public readonly type: OneTimeTokenType,
    public readonly subject: string | null,
    public readonly metadata: Record<string, unknown>,
    public readonly expiresAt: Date,
    public usedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static fromSnapshot(s: OneTimeTokenSnapshot): OneTimeToken {
    return new OneTimeToken(
      s.jti, s.type as OneTimeTokenType, s.subject, s.metadata,
      new Date(s.expiresAt), s.usedAt ? new Date(s.usedAt) : null,
      new Date(s.createdAt),
    );
  }

  snapshot(): OneTimeTokenSnapshot {
    return {
      jti: this.jti, type: this.type, subject: this.subject, metadata: this.metadata,
      expiresAt: this.expiresAt.toISOString(),
      usedAt: this.usedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }

  isExpired(): boolean {
    return this.expiresAt.getTime() < Date.now();
  }

  isConsumed(): boolean {
    return this.usedAt !== null;
  }
}
