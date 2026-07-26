// Replay: بازپخش رویدادها برای بازسازی Projectionها

import { getDb } from '../../../config/database.js';
import { OutboxRepository } from '../outbox/OutboxRepository.js';

export interface ReplayHandler {
  handleEvent(eventType: string, payload: Record<string, unknown>): Promise<void>;
}

export class ReplayEngine {
  constructor(
    private readonly outboxRepo: OutboxRepository,
    private readonly handlers: Map<string, ReplayHandler>,
  ) {}

  async replayAll(eventTypes?: string[]): Promise<number> {
    const db = await getDb();
    let condition = '';
    const params: unknown[] = [];

    if (eventTypes && eventTypes.length > 0) {
      condition = `WHERE event_type = ANY($1)`;
      params.push(eventTypes);
    }

    const { rows } = await db.query(
      `SELECT * FROM outbox_events ${condition} ORDER BY created_at ASC`, params,
    );
    let count = 0;

    for (const row of rows as Record<string, unknown>[]) {
      const eventType = row.event_type as string;
      const handler = this.handlers.get(eventType);
      if (handler) {
        const payload = typeof row.payload === 'string'
          ? JSON.parse(row.payload as string)
          : row.payload as Record<string, unknown>;
        await handler.handleEvent(eventType, payload);
        count++;
      }
    }
    return count;
  }

  async replaySince(since: Date, eventTypes?: string[]): Promise<number> {
    const db = await getDb();
    let condition = 'WHERE created_at >= $1';
    const params: unknown[] = [since];

    if (eventTypes && eventTypes.length > 0) {
      condition += ' AND event_type = ANY($2)';
      params.push(eventTypes);
    }

    const { rows } = await db.query(
      `SELECT * FROM outbox_events ${condition} ORDER BY created_at ASC`, params,
    );
    let count = 0;

    for (const row of rows as Record<string, unknown>[]) {
      const eventType = row.event_type as string;
      const handler = this.handlers.get(eventType);
      if (handler) {
        const payload = typeof row.payload === 'string'
          ? JSON.parse(row.payload as string)
          : row.payload as Record<string, unknown>;
        await handler.handleEvent(eventType, payload);
        count++;
      }
    }
    return count;
  }
}
