import { getDb } from '../../../config/database.js';
import { RefreshToken } from '../../entities/refreshToken/RefreshToken.entity.js';
import type { RefreshTokenRepository } from '../../entities/refreshToken/RefreshToken.repository.js';

function toEntity(r: Record<string, unknown>): RefreshToken {
  return RefreshToken.fromSnapshot({
    id: r.id as string,
    userId: r.user_id as string,
    tokenHash: r.token_hash as string,
    expiresAt: r.expires_at as string,
    revokedAt: r.revoked_at as string | null,
    createdAt: r.created_at as string,
    lastUsedAt: (r.last_used_at as string | null) ?? null,
    lastIp: (r.last_ip as string | null) ?? null,
    lastUserAgent: (r.last_user_agent as string | null) ?? null,
  });
}

export class RefreshTokenRepositoryImpl implements RefreshTokenRepository {
  async create(data: {
    user_id: string;
    token_hash: string;
    expires_at: Date;
    last_ip?: string | null;
    last_user_agent?: string | null;
  }): Promise<RefreshToken> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, last_used_at, last_ip, last_user_agent)
       VALUES ($1, $2, $3, NOW(), $4, $5)
       RETURNING *`,
      [data.user_id, data.token_hash, data.expires_at, data.last_ip ?? null, data.last_user_agent ?? null],
    );
    return toEntity(rows[0] as Record<string, unknown>);
  }

  async findByTokenHash(hash: string): Promise<RefreshToken | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > NOW()',
      [hash],
    );
    if (!rows.length) return null;
    return toEntity(rows[0] as Record<string, unknown>);
  }

  async revoke(id: string): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1', [id]);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const db = await getDb();
    await db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [userId],
    );
  }
}
