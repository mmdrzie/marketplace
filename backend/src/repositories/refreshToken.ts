import { getDb } from '../config/database.js';
import { RefreshTokenRepositoryImpl } from '../domain/infrastructure/refreshToken/RefreshTokenRepository.impl.js';

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

export class RefreshTokenRepository {
  private _domainImpl: RefreshTokenRepositoryImpl;

  constructor(domainImpl?: RefreshTokenRepositoryImpl) {
    this._domainImpl = domainImpl ?? new RefreshTokenRepositoryImpl();
  }

  async create(data: { user_id: string; token_hash: string; expires_at: Date }): Promise<RefreshTokenRow> {
    const result = await this._domainImpl.create(data);
    const s = result.snapshot();
    return {
      id: s.id,
      user_id: s.userId,
      token_hash: s.tokenHash,
      expires_at: s.expiresAt,
      revoked_at: s.revokedAt,
      created_at: s.createdAt,
    };
  }

  async findByTokenHash(hash: string): Promise<RefreshTokenRow | undefined> {
    const result = await this._domainImpl.findByTokenHash(hash);
    if (!result) return undefined;
    const s = result.snapshot();
    return {
      id: s.id,
      user_id: s.userId,
      token_hash: s.tokenHash,
      expires_at: s.expiresAt,
      revoked_at: s.revokedAt,
      created_at: s.createdAt,
    };
  }

  async revoke(id: string): Promise<void> {
    await this._domainImpl.revoke(id);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this._domainImpl.revokeAllForUser(userId);
  }
}

export const refreshTokenRepo = new RefreshTokenRepository();
