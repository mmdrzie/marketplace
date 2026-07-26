import type { Clock } from '../infrastructure/clock/Clock.js';
import { SystemClock } from '../infrastructure/clock/SystemClock.js';
import type { EventEnvelope } from './EventEnvelope.js';

export class EventEnvelopeFactory {
  private counter = 0;

  constructor(private readonly clock: Clock = new SystemClock()) {}

  create<T>(
    eventType: string,
    aggregateType: string,
    aggregateId: string,
    payload: T,
    correlationId?: string,
    causationId?: string,
  ): EventEnvelope<T> {
    this.counter++;
    return {
      eventId: `evt_${Date.now()}_${this.counter}`,
      eventType,
      version: 1,
      occurredAt: this.clock.now().toISOString(),
      correlationId: correlationId ?? `cor_${Date.now()}_${this.counter}`,
      causationId: causationId ?? null,
      aggregateType,
      aggregateId,
      payload,
    };
  }
}
