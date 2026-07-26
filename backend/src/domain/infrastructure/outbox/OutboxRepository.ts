import { OutboxEvent } from './OutboxEvent.entity.js';

export interface OutboxRepository {
  save(event: OutboxEvent): Promise<void>;
  findPending(limit?: number): Promise<OutboxEvent[]>;
  findFailed(limit?: number): Promise<OutboxEvent[]>;
  findDeadLetters(): Promise<OutboxEvent[]>;
  updateStatus(event: OutboxEvent): Promise<void>;
  deletePublished(before: Date): Promise<number>;
}
