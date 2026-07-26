import { getDb } from '../../../config/database.js';
import { OutboxEvent } from './OutboxEvent.entity.js';
import type { OutboxRepository } from './OutboxRepository.js';

export class OutboxRepositoryImpl implements OutboxRepository {
  async save(event: OutboxEvent): Promise<void> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, event_type_version, payload, metadata, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [event.aggregateType, event.aggregateId, event.eventType,
       event.eventTypeVersion, JSON.stringify(event.payload),
       JSON.stringify(event.metadata), event.status],
    );
    (event as any).id = (rows[0] as Record<string, unknown>).id;
  }

  async findPending(limit = 50): Promise<OutboxEvent[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM outbox_events WHERE status = 'pending' ORDER BY created_at ASC LIMIT $1`, [limit],
    );
    return (rows as Record<string, unknown>[]).map(r => this.rowToEntity(r));
  }

  async findFailed(limit = 50): Promise<OutboxEvent[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM outbox_events WHERE status = 'failed' AND retry_count < max_retries ORDER BY created_at ASC LIMIT $1`, [limit],
    );
    return (rows as Record<string, unknown>[]).map(r => this.rowToEntity(r));
  }

  async findDeadLetters(): Promise<OutboxEvent[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM outbox_events WHERE status = 'dead_letter' ORDER BY created_at DESC`,
    );
    return (rows as Record<string, unknown>[]).map(r => this.rowToEntity(r));
  }

  async updateStatus(event: OutboxEvent): Promise<void> {
    const db = await getDb();
    await db.query(
      `UPDATE outbox_events SET status=$1, retry_count=$2, last_error=$3, published_at=$4 WHERE id=$5`,
      [event.status, event.retryCount, event.lastError, event.publishedAt, event.id],
    );
  }

  async deletePublished(before: Date): Promise<number> {
    const db = await getDb();
    const { rowCount } = await db.query(
      `DELETE FROM outbox_events WHERE status = 'published' AND published_at < $1`, [before],
    );
    return rowCount ?? 0;
  }

  private rowToEntity(r: Record<string, unknown>): OutboxEvent {
    return new OutboxEvent(
      r.id as number, r.aggregate_type as string, r.aggregate_id as string,
      r.event_type as string, r.event_type_version as number,
      typeof r.payload === 'string' ? JSON.parse(r.payload as string) : r.payload as Record<string, unknown>,
      typeof r.metadata === 'string' ? JSON.parse(r.metadata as string) : r.metadata as Record<string, unknown>,
      r.status as OutboxEvent['status'], r.retry_count as number,
      r.max_retries as number, r.last_error as string | null,
      r.published_at ? new Date(r.published_at as string) : null,
      new Date(r.created_at as string),
    );
  }
}
