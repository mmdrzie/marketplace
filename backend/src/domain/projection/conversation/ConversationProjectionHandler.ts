import type { EventEnvelope } from '../../events/EventEnvelope.js';
import type { ConversationProjectionRepository } from './ConversationProjectionRepository.js';

interface LastMessageInfo {
  id: number | null;
  body: string | null;
  type: string | null;
  senderId: string | null;
}

export class ConversationProjectionHandler {
  constructor(
    private readonly projectionRepo: ConversationProjectionRepository,
  ) {}

  async handle(envelope: EventEnvelope): Promise<void> {
    switch (envelope.eventType) {
      case 'conversation.started.v1':
        await this.handleStarted(envelope);
        break;
      case 'message.sent.v1':
        await this.handleMessageSent(envelope);
        break;
      case 'message.edited.v1':
        await this.handleMessageEdited(envelope);
        break;
      case 'conversation.archived.v1':
      case 'conversation.blocked.v1':
      case 'conversation.locked.v1':
      case 'conversation.deleted.v1':
        await this.handleLifecycle(envelope);
        break;
    }
  }

  private async handleStarted(envelope: EventEnvelope): Promise<void> {
    const p = envelope.payload as Record<string, unknown>;
    const existing = await this.projectionRepo.findById(p.conversationId as number);
    if (existing) return;

    await this.projectionRepo.upsert({
      id: p.conversationId as number,
      listingId: p.listingId as number,
      listingSnapshot: p.listingSnapshot as Record<string, unknown>,
      buyerId: p.buyerId as string,
      buyerName: (p.buyerName as string) ?? '',
      buyerAvatar: (p.buyerAvatar as string | null) ?? null,
      sellerId: p.sellerId as string,
      sellerName: (p.sellerName as string) ?? '',
      sellerAvatar: (p.sellerAvatar as string | null) ?? null,
      sellerRole: (p.sellerRole as string | null) ?? null,
      lastMessageId: null,
      lastMessage: null,
      lastMessageType: null,
      lastSenderId: null,
      lastActivity: null,
      lifecycle: 'active',
      projectionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async handleMessageSent(envelope: EventEnvelope): Promise<void> {
    const p = envelope.payload as Record<string, unknown>;
    const lastMsg = p.lastMessage as LastMessageInfo | undefined;

    await this.projectionRepo.upsert({
      id: p.conversationId as number,
      listingId: 0,
      listingSnapshot: {},
      buyerId: '',
      buyerName: '',
      buyerAvatar: null,
      sellerId: '',
      sellerName: '',
      sellerAvatar: null,
      sellerRole: null,
      lastMessageId: (lastMsg?.id ?? p.messageId) as number | null,
      lastMessage: (lastMsg?.body ?? p.body) as string | null,
      lastMessageType: (lastMsg?.type ?? p.type) as string | null,
      lastSenderId: (lastMsg?.senderId ?? p.senderId) as string | null,
      lastActivity: new Date().toISOString(),
      lifecycle: 'active',
      projectionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async handleMessageEdited(envelope: EventEnvelope): Promise<void> {
    const p = envelope.payload as Record<string, unknown>;
    await this.projectionRepo.upsert({
      id: p.conversationId as number,
      listingId: 0,
      listingSnapshot: {},
      buyerId: '',
      buyerName: '',
      buyerAvatar: null,
      sellerId: '',
      sellerName: '',
      sellerAvatar: null,
      sellerRole: null,
      lastMessageId: p.messageId as number | null,
      lastMessage: p.body as string | null,
      lastMessageType: null,
      lastSenderId: null,
      lastActivity: new Date().toISOString(),
      lifecycle: 'active',
      projectionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async handleLifecycle(envelope: EventEnvelope): Promise<void> {
    const p = envelope.payload as Record<string, unknown>;
    const lifecycle = envelope.eventType.replace('conversation.', '').replace('.v1', '');

    await this.projectionRepo.upsert({
      id: p.conversationId as number,
      listingId: 0,
      listingSnapshot: {},
      buyerId: '',
      buyerName: '',
      buyerAvatar: null,
      sellerId: '',
      sellerName: '',
      sellerAvatar: null,
      sellerRole: null,
      lastMessageId: null,
      lastMessage: null,
      lastMessageType: null,
      lastSenderId: null,
      lastActivity: new Date().toISOString(),
      lifecycle,
      projectionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
