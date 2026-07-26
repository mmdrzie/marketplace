import { getDb } from '../../../config/database.js';
import type { IdempotencyRepository } from './Idempotency.repository.js';

export class IdempotencyRepositoryImpl implements IdempotencyRepository {
  async isProcessed(idempotencyKey: string): Promise<boolean> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT 1 FROM idempotency_keys WHERE key = $1 AND processed = true', [idempotencyKey],
    );
    return rows.length > 0;
  }

  async markProcessed(idempotencyKey: string, response?: unknown): Promise<void> {
    const db = await getDb();
    await db.query(
      `INSERT INTO idempotency_keys (key, response, processed)
       VALUES ($1, $2, true)
       ON CONFLICT (key) DO UPDATE SET processed = true, response = $2`,
      [idempotencyKey, response ? JSON.stringify(response) : null],
    );
  }

  async getResponse(idempotencyKey: string): Promise<unknown | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT response FROM idempotency_keys WHERE key = $1 AND processed = true', [idempotencyKey],
    );
    if (!rows.length) return null;
    const row = rows[0] as Record<string, unknown>;
    return typeof row.response === 'string' ? JSON.parse(row.response as string) : row.response;
  }
}
