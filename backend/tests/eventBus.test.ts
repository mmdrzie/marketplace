import { describe, it, expect, vi } from 'vitest';
import { InMemoryEventBus, TypedEvent } from '../src/domain/events';

describe('InMemoryEventBus', () => {
  it('publishes event to all subscribers', () => {
    const bus = new InMemoryEventBus();
    const event = new TypedEvent<{ id: string }>('test.event');
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.subscribe(event, handler1);
    bus.subscribe(event, handler2);
    bus.publish(event, { id: '123' });

    expect(handler1).toHaveBeenCalledWith({ id: '123' });
    expect(handler2).toHaveBeenCalledWith({ id: '123' });
  });

  it('does not call unsubscribed handlers', () => {
    const bus = new InMemoryEventBus();
    const event = new TypedEvent<{ id: string }>('test.event');
    const handler = vi.fn();

    bus.subscribe(event, handler);
    bus.unsubscribe(event, handler);
    bus.publish(event, { id: '123' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not propagate handler errors to other handlers', () => {
    const bus = new InMemoryEventBus();
    const event = new TypedEvent('test.event');
    const handler1 = vi.fn(() => { throw new Error('handler1 error'); });
    const handler2 = vi.fn();

    bus.subscribe(event, handler1);
    bus.subscribe(event, handler2);
    bus.publish(event, undefined);

    expect(handler2).toHaveBeenCalled();
  });
});
