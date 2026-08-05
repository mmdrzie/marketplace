export interface RefreshTokenSnapshot {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  lastIp: string | null;
  lastUserAgent: string | null;
}

export class RefreshToken {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: string,
    public readonly expiresAt: Date,
    public revokedAt: Date | null,
    public readonly createdAt: Date,
    public lastUsedAt: Date | null,
    public lastIp: string | null,
    public lastUserAgent: string | null,
  ) {}

  static create(props: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    lastUsedAt?: Date | null;
    lastIp?: string | null;
    lastUserAgent?: string | null;
  }): RefreshToken {
    return new RefreshToken(
      props.id,
      props.userId,
      props.tokenHash,
      props.expiresAt,
      null,
      new Date(),
      props.lastUsedAt ?? new Date(),
      props.lastIp ?? null,
      props.lastUserAgent ?? null,
    );
  }

  static fromSnapshot(s: RefreshTokenSnapshot): RefreshToken {
    return new RefreshToken(
      s.id,
      s.userId,
      s.tokenHash,
      new Date(s.expiresAt),
      s.revokedAt ? new Date(s.revokedAt) : null,
      new Date(s.createdAt),
      s.lastUsedAt ? new Date(s.lastUsedAt) : null,
      s.lastIp ?? null,
      s.lastUserAgent ?? null,
    );
  }

  snapshot(): RefreshTokenSnapshot {
    return {
      id: this.id,
      userId: this.userId,
      tokenHash: this.tokenHash,
      expiresAt: this.expiresAt.toISOString(),
      revokedAt: this.revokedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      lastUsedAt: this.lastUsedAt?.toISOString() ?? null,
      lastIp: this.lastIp,
      lastUserAgent: this.lastUserAgent,
    };
  }

  revoke(): void {
    this.revokedAt = new Date();
  }

  get isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  get isActive(): boolean {
    return !this.isExpired && this.revokedAt === null;
  }
}
