export type EventHandler<T = unknown> = (event: T) => void | Promise<void>;

export interface EventBus {
  publish<T>(event: TypedEvent<T>, payload: T): void;
  subscribe<T>(event: TypedEvent<T>, handler: EventHandler<T>): void;
  unsubscribe<T>(event: TypedEvent<T>, handler: EventHandler<T>): void;
}

export class TypedEvent<T = void> {
  constructor(public readonly name: string) {}
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

// ── Domain Events ──

export const UserRegistered = new TypedEvent<{ userId: string; email: string; name: string }>('user.registered');
export const UserLoggedIn = new TypedEvent<{ userId: string }>('user.logged_in');
export const EmailVerified = new TypedEvent<{ userId: string; email: string }>('email.verified');
export const PhoneVerified = new TypedEvent<{ userId: string; phone: string }>('phone.verified');

export const ListingCreated = new TypedEvent<{ listingId: string; userId: string }>('listing.created');
export const ListingUpdated = new TypedEvent<{ listingId: string; userId: string }>('listing.updated');
export const ListingDeleted = new TypedEvent<{ listingId: string; userId: string }>('listing.deleted');
export const ListingStatusChanged = new TypedEvent<{ listingId: string; userId: string; oldStatus: string; newStatus: string }>('listing.status_changed');

export const ConversationStarted = new TypedEvent<{ conversationId: string; listingId: string; buyerId: string; sellerId: string }>('conversation.started');
export const MessageSent = new TypedEvent<{ conversationId: string; senderId: string; body: string }>('message.sent');

export const AccountUpgraded = new TypedEvent<{ userId: string; role: string }>('account.upgraded');
