import type { EventEnvelope } from '../../events/EventEnvelope.js';
import type { ConversationSummaryRepository } from './ConversationSummaryRepository.js';

export class ConversationSummaryHandler {
  constructor(
    private readonly summaryRepo: ConversationSummaryRepository,
  ) {}

  async handle(envelope: EventEnvelope): Promise<void> {
    switch (envelope.eventType) {
      case 'conversation.started.v1':
        await this.handleStarted(envelope);
        break;
      case 'message.sent.v1':
        await this.handleMessageSent(envelope);
        break;
    }
  }

  private async handleStarted(envelope: EventEnvelope): Promise<void> {
    const p = envelope.payload as Record<string, unknown>;
    const existing = await this.summaryRepo.findById(p.conversationId as number);
    if (existing) return;

    await this.summaryRepo.upsert({
      conversationId: p.conversationId as number,
      firstMessageAt: null,
      lastMessageAt: null,
      messageCount: 0,
      avgResponseTime: null,
      buyerLastSeen: null,
      sellerLastSeen: null,
      projectionVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  private async handleMessageSent(envelope: EventEnvelope): Promise<void> {
    const p = envelope.payload as Record<string, unknown>;
    const existing = await this.summaryRepo.findById(p.conversationId as number);

    const now = new Date().toISOString();

    if (existing) {
      await this.summaryRepo.upsert({
        ...existing,
        lastMessageAt: now,
        messageCount: existing.messageCount + 1,
        updatedAt: now,
      });
    } else {
      await this.summaryRepo.upsert({
        conversationId: p.conversationId as number,
        firstMessageAt: now,
        lastMessageAt: now,
        messageCount: 1,
        avgResponseTime: null,
        buyerLastSeen: null,
        sellerLastSeen: null,
        projectionVersion: 1,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
}
