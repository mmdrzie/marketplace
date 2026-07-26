/**
 * @deprecated This file is a compatibility wrapper.
 *
 * The single source of truth for event name constants is `EventTypes.ts`.
 * New code should import from `EventTypes.ts` directly.
 *
 * The TypedEvent classes, EventBus interface, and InMemoryEventBus are
 * still needed during the v5.1 migration. They will be removed in Sprint 3.
 *
 * Migration path:
 *   Import event constants from EventTypes.ts → EventTypes.{Domain}Events.{event}
 *   Use Outbox pattern instead of eventBus.publish()
 *   Use DI instead of the global eventBus singleton
 */

import {
  ListingEvents,
  ConversationEvents,
  MessageEvents,
  UserEvents,
  BrandEvents,
  ModelEvents,
  VariantEvents,
  DealerEvents,
} from './EventTypes.js';

export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export interface EventBus {
  publish<T>(event: TypedEvent<T>, payload: T): void;
  subscribe<T>(event: TypedEvent<T>, handler: EventHandler<T>): void;
  unsubscribe<T>(event: TypedEvent<T>, handler: EventHandler<T>): void;
}

export interface EventMetadata {
  eventId: string;
  correlationId: string;
  causationId: string | null;
  timestamp: string;
  eventTypeVersion: number;
  payloadVersion: number;
  schemaVersion: number;
}

export class TypedEvent<T = void> {
  constructor(
    public readonly name: string,
    public readonly eventTypeVersion: number = 1,
    public readonly payloadVersion: number = 1,
    public readonly schemaVersion: number = 1,
  ) {}
}

let _eventCounter = 0;

export function createEventMetadata(
  correlationId: string,
  causationId: string | null = null,
): EventMetadata {
  _eventCounter++;
  return {
    eventId: `evt_${Date.now()}_${_eventCounter}`,
    correlationId,
    causationId,
    timestamp: new Date().toISOString(),
    eventTypeVersion: 1,
    payloadVersion: 1,
    schemaVersion: 1,
  };
}

export class InMemoryEventBus implements EventBus {
  private handlers = new Map<string, Set<EventHandler>>();

  publish<T>(event: TypedEvent<T>, payload: T): void {
    const handlers = this.handlers.get(event.name);
    if (!handlers) return;

    for (const handler of handlers) {
      try {
        const result = handler(payload);
        if (result instanceof Promise) {
          result.catch((err) => console.error(`[eventbus] handler error for ${event.name}:`, err));
        }
      } catch (err) {
        console.error(`[eventbus] handler error for ${event.name}:`, err);
      }
    }
  }

  subscribe<T>(event: TypedEvent<T>, handler: EventHandler<T>): void {
    if (!this.handlers.has(event.name)) {
      this.handlers.set(event.name, new Set());
    }
    this.handlers.get(event.name)!.add(handler as EventHandler);
  }

  unsubscribe<T>(event: TypedEvent<T>, handler: EventHandler<T>): void {
    this.handlers.get(event.name)?.delete(handler as EventHandler);
  }
}

export const eventBus = new InMemoryEventBus();

// ── Generic Event Wrapper ──
export interface DomainEvent<T> {
  metadata: EventMetadata;
  payload: T;
}

// ── User Events ──
export const UserRegistered = new TypedEvent<{ userId: string; email: string; name: string }>(UserEvents.registered);
export const UserLoggedIn = new TypedEvent<{ userId: string }>(UserEvents.loggedIn);
export const EmailVerified = new TypedEvent<{ userId: string; email: string }>(UserEvents.emailVerified);
export const PhoneVerified = new TypedEvent<{ userId: string; phone: string }>(UserEvents.phoneVerified);

// ── Listing Events ──
export const ListingCreated = new TypedEvent<{ listingId: number; userId: string; title: string }>(ListingEvents.created);
export const ListingUpdated = new TypedEvent<{ listingId: number; userId: string; changes: string[] }>(ListingEvents.updated);
export const ListingDeleted = new TypedEvent<{ listingId: number; userId: string }>(ListingEvents.deleted);
export const ListingStatusChanged = new TypedEvent<{
  listingId: number; userId: string;
  oldStatus: string; newStatus: string;
}>(ListingEvents.statusChanged);

// ── Vehicle Events ──
export const BrandCreated = new TypedEvent<{ brandId: number; name: string }>(BrandEvents.created);
export const BrandUpdated = new TypedEvent<{ brandId: number; changes: string[] }>(BrandEvents.updated);
export const ModelCreated = new TypedEvent<{ modelId: number; brandId: number; name: string }>(ModelEvents.created);
export const VariantCreated = new TypedEvent<{ variantId: number; modelId: number; name: string }>(VariantEvents.created);

// ── Dealer Events ──
export const DealerVerified = new TypedEvent<{ dealerId: number; userId: string }>(DealerEvents.verified);

// ── Conversation Events ──
export const ConversationStarted = new TypedEvent<{ conversationId: string; listingId: number; buyerId: string; sellerId: string }>(ConversationEvents.started);
export const MessageSent = new TypedEvent<{ conversationId: string; senderId: string; body: string }>(MessageEvents.sent);

export const AccountUpgraded = new TypedEvent<{ userId: string; role: string }>(UserEvents.accountUpgraded);
