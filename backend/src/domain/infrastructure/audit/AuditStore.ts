import type { EventEnvelope } from '../../events/EventEnvelope.js';

export interface AuditStore {
  append(event: EventEnvelope): Promise<void>;
  query(aggregateType: string, aggregateId: string): Promise<EventEnvelope[]>;
}
