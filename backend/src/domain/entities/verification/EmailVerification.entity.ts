export interface EmailVerificationSnapshot {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  verifiedAt: string | null;
  createdAt: string;
}

export class EmailVerification {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public verifiedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): EmailVerification {
    return new EmailVerification(
      props.id, props.userId, props.tokenHash,
      props.expiresAt, null, new Date(),
    );
  }

  static fromSnapshot(s: EmailVerificationSnapshot): EmailVerification {
    return new EmailVerification(
      s.id, s.userId, s.tokenHash,
      new Date(s.expiresAt),
      s.verifiedAt ? new Date(s.verifiedAt) : null,
      new Date(s.createdAt),
    );
  }

  snapshot(): EmailVerificationSnapshot {
    return {
      id: this.id,
      userId: this.userId,
      tokenHash: this.tokenHash,
      expiresAt: this.expiresAt.toISOString(),
      verifiedAt: this.verifiedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }

  markVerified(): void {
    this.verifiedAt = new Date();
  }

  get isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  get isVerified(): boolean {
    return this.verifiedAt !== null;
  }
}
