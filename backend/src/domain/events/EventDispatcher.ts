import type { EventEnvelope } from './EventEnvelope.js';

export type EventHandler = (envelope: EventEnvelope) => Promise<void> | void;

export class EventDispatcher {
  private handlers = new Map<string, Set<EventHandler>>();
  private wildcardHandlers = new Set<EventHandler>();

  register(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  onAny(handler: EventHandler): void {
    this.wildcardHandlers.add(handler);
  }

  unregister(eventType: string, handler: EventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  async dispatch(envelope: EventEnvelope): Promise<void> {
    const handlers = this.handlers.get(envelope.eventType);
    if (handlers) {
      for (const handler of handlers) {
        await handler(envelope);
      }
    }

    for (const handler of this.wildcardHandlers) {
      await handler(envelope);
    }
  }

  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
  }
}
