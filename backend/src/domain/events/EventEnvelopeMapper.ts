import type { EventEnvelope } from './EventEnvelope.js';
import type { OutboxEvent } from '../infrastructure/outbox/OutboxEvent.entity.js';
import type { EventMetadata } from './index.js';

export function envelopeToOutboxEvent(envelope: EventEnvelope): {
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  eventTypeVersion: number;
  payload: Record<string, unknown>;
  metadata: Record<string, unknown>;
} {
  return {
    aggregateType: envelope.aggregateType,
    aggregateId: envelope.aggregateId,
    eventType: envelope.eventType,
    eventTypeVersion: envelope.version,
    payload: envelope.payload as Record<string, unknown>,
    metadata: {
      eventId: envelope.eventId,
      correlationId: envelope.correlationId,
      causationId: envelope.causationId,
      occurredAt: envelope.occurredAt,
    },
  };
}

export function envelopeToMetadata(envelope: EventEnvelope): EventMetadata {
  return {
    eventId: envelope.eventId,
    correlationId: envelope.correlationId,
    causationId: envelope.causationId,
    timestamp: envelope.occurredAt,
    eventTypeVersion: envelope.version,
    payloadVersion: 1,
    schemaVersion: 1,
  };
}
