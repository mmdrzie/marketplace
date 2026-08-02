import { getDb } from '../../../config/database.js';
import { OneTimeToken } from '../../entities/oauth/OneTimeToken.entity.js';
import type { OneTimeTokenRepository } from '../../entities/oauth/OneTimeToken.repository.js';

export class OneTimeTokenRepositoryImpl implements OneTimeTokenRepository {
  async create(data: {
    jti: string;
    type: string;
    subject?: string | null;
    metadata?: Record<string, unknown>;
    expiresAt: Date;
  }): Promise<OneTimeToken> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO one_time_tokens (jti, type, subject, metadata, expires_at)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.jti, data.type, data.subject ?? null, JSON.stringify(data.metadata ?? {}), data.expiresAt.toISOString()],
    );
    return OneTimeToken.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async consume(jti: string, expectedType: string): Promise<OneTimeToken | null> {
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE one_time_tokens SET used_at = NOW()
       WHERE jti = $1 AND type = $2 AND used_at IS NULL AND expires_at > NOW()
       RETURNING *`,
      [jti, expectedType],
    );
    if (!rows.length) return null;
    return OneTimeToken.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async peek(jti: string, expectedType: string): Promise<OneTimeToken | null> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM one_time_tokens WHERE jti = $1 AND type = $2`,
      [jti, expectedType],
    );
    if (!rows.length) return null;
    return OneTimeToken.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async purgeExpired(): Promise<number> {
    const db = await getDb();
    const result = await db.query(`DELETE FROM one_time_tokens WHERE expires_at < NOW()`);
    return result.rowCount ?? 0;
  }

  private toSnapshot(row: Record<string, unknown>) {
    return {
      jti: row.jti as string,
      type: row.type as string,
      subject: row.subject as string | null,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      expiresAt: row.expires_at as string,
      usedAt: row.used_at as string | null,
      createdAt: row.created_at as string,
    };
  }
}
