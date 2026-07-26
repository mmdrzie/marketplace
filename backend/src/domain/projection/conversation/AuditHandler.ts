import type { EventEnvelope } from '../../events/EventEnvelope.js';
import type { AuditStore } from '../../infrastructure/audit/AuditStore.js';

export class AuditHandler {
  constructor(
    private readonly auditStore: AuditStore,
  ) {}

  async handle(envelope: EventEnvelope): Promise<void> {
    await this.auditStore.write({
      eventType: envelope.eventType,
      aggregateType: envelope.aggregateType,
      aggregateId: envelope.aggregateId,
      payload: envelope.payload as Record<string, unknown>,
      status: 'processed',
      metadata: {
        eventId: envelope.eventId,
        correlationId: envelope.correlationId,
        causationId: envelope.causationId,
        occurredAt: envelope.occurredAt,
      },
    });
  }
}
