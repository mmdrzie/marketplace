export interface EventEnvelope<T = unknown> {
  eventId: string;
  eventType: string;
  version: number;
  occurredAt: string;
  correlationId: string;
  causationId: string | null;
  aggregateType: string;
  aggregateId: string;
  payload: T;
}
