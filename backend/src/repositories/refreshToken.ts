import { getDb } from '../config/database.js';

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

export class RefreshTokenRepository {
  async create(data: { user_id: string; token_hash: string; expires_at: Date }): Promise<RefreshTokenRow> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.user_id, data.token_hash, data.expires_at],
    );
    return rows[0] as RefreshTokenRow;
  }

  async findByTokenHash(hash: string): Promise<RefreshTokenRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 AND revoked_at IS NULL',
      [hash],
    );
    return rows[0] as RefreshTokenRow | undefined;
  }

  async revoke(id: string): Promise<void> {
    const db = await getDb();
    await db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1',
      [id],
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const db = await getDb();
    await db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL',
      [userId],
    );
  }
}

export const refreshTokenRepo = new RefreshTokenRepository();
