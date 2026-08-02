export type OauthProvider = 'google' | 'apple' | 'github' | 'microsoft';

export interface OauthAccountSnapshot {
  id: string;
  userId: string;
  provider: OauthProvider;
  providerAccountId: string;
  providerUserName: string | null;
  providerAvatar: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  deletedAt: string | null;
}

export class OauthAccount {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly provider: OauthProvider,
    public readonly providerAccountId: string,
    public providerUserName: string | null,
    public providerAvatar: string | null,
    public email: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public lastLoginAt: Date | null,
    public deletedAt: Date | null,
  ) {}

  static fromSnapshot(s: OauthAccountSnapshot): OauthAccount {
    return new OauthAccount(
      s.id, s.userId, s.provider, s.providerAccountId,
      s.providerUserName, s.providerAvatar, s.email,
      new Date(s.createdAt), new Date(s.updatedAt),
      s.lastLoginAt ? new Date(s.lastLoginAt) : null,
      s.deletedAt ? new Date(s.deletedAt) : null,
    );
  }

  snapshot(): OauthAccountSnapshot {
    return {
      id: this.id, userId: this.userId, provider: this.provider,
      providerAccountId: this.providerAccountId,
      providerUserName: this.providerUserName,
      providerAvatar: this.providerAvatar,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      lastLoginAt: this.lastLoginAt?.toISOString() ?? null,
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }

  isLinked(): boolean {
    return this.deletedAt === null;
  }

  /** Called on successful login only (not on link). */
  markLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  /** Refresh the identity snapshot from the provider. */
  refreshSnapshot(identity: { name?: string | null; avatarUrl?: string | null; email?: string | null }): void {
    if (identity.name !== undefined) this.providerUserName = identity.name;
    if (identity.avatarUrl !== undefined) this.providerAvatar = identity.avatarUrl;
    if (identity.email !== undefined) this.email = identity.email;
    this.updatedAt = new Date();
  }

  /** Soft delete (disconnect). */
  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  /** Restore a previously disconnected identity. */
  restore(): void {
    this.deletedAt = null;
    this.updatedAt = new Date();
  }
}
