import type { EventEnvelope } from '../../events/EventEnvelope.js';

export interface ConversationAI {
  handle(event: EventEnvelope<{ conversationId: string; senderId: string; body: string }>): Promise<void>;
}
