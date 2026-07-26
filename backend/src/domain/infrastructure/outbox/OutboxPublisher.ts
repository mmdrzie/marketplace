import { OutboxEvent } from './OutboxEvent.entity.js';
import { OutboxRepository } from './OutboxRepository.js';

export class OutboxWriter {
  constructor(private readonly outboxRepo: OutboxRepository) {}

  async write(event: {
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    payload: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const outboxEvent = OutboxEvent.create({
      aggregateType: event.aggregateType,
      aggregateId: event.aggregateId,
      eventType: event.eventType,
      payload: event.payload,
      metadata: event.metadata ?? {},
    });
    await this.outboxRepo.save(outboxEvent);
  }
}

export class OutboxPublisher {
  constructor(private readonly outboxRepo: OutboxRepository) {}

  async publishBatch(limit = 50): Promise<number> {
    const pending = await this.outboxRepo.findPending(limit);
    let published = 0;

    for (const event of pending) {
      try {
        // In real impl: publish to queue (RabbitMQ/SQS/PgNotify)
        console.log(`[outbox] publishing ${event.eventType} [id=${event.id}]`);
        event.markPublished();
        await this.outboxRepo.updateStatus(event);
        published++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        event.markFailed(msg);
        await this.outboxRepo.updateStatus(event);
      }
    }
    return published;
  }

  async retryFailed(limit = 20): Promise<number> {
    const failed = await this.outboxRepo.findFailed(limit);
    let retried = 0;

    for (const event of failed) {
      try {
        event.markPublished();
        await this.outboxRepo.updateStatus(event);
        retried++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        event.markFailed(msg);
        await this.outboxRepo.updateStatus(event);
      }
    }
    return retried;
  }
}
