import type { ConversationRepository } from '../../entities/conversation/Conversation.repository.js';
import type { MessageRepository } from '../../entities/conversation/Message.repository.js';
import type { OutboxRepository } from '../outbox/OutboxRepository.js';

export interface UnitOfWork {
  execute<T>(fn: (uow: {
    conversationRepo: ConversationRepository;
    messageRepo: MessageRepository;
    outboxRepo: OutboxRepository;
  }) => Promise<T>): Promise<T>;
}
