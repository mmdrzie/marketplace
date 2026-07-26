import { TransactionManager, transactionManager as defaultTx } from '../outbox/TransactionManager.js';
import type { ConversationRepository } from '../../entities/conversation/Conversation.repository.js';
import type { MessageRepository } from '../../entities/conversation/Message.repository.js';
import type { OutboxRepository } from '../outbox/OutboxRepository.js';
import { ConversationRepositoryImpl } from '../conversation/ConversationRepository.impl.js';
import { MessageRepositoryImpl } from '../conversation/MessageRepository.impl.js';
import { OutboxRepositoryImpl } from '../outbox/OutboxRepository.impl.js';
import type { UnitOfWork } from './UnitOfWork.js';

export class UnitOfWorkImpl implements UnitOfWork {
  private conversationRepoInstance: ConversationRepository;
  private messageRepoInstance: MessageRepository;
  private outboxRepoInstance: OutboxRepository;

  constructor(
    private readonly txManager: TransactionManager = defaultTx,
    conversationRepo?: ConversationRepository,
    messageRepo?: MessageRepository,
    outboxRepo?: OutboxRepository,
  ) {
    this.conversationRepoInstance = conversationRepo ?? new ConversationRepositoryImpl();
    this.messageRepoInstance = messageRepo ?? new MessageRepositoryImpl();
    this.outboxRepoInstance = outboxRepo ?? new OutboxRepositoryImpl();
  }

  async execute<T>(
    fn: (uow: {
      conversationRepo: ConversationRepository;
      messageRepo: MessageRepository;
      outboxRepo: OutboxRepository;
    }) => Promise<T>,
  ): Promise<T> {
    return this.txManager.run(async () => {
      return fn({
        conversationRepo: this.conversationRepoInstance,
        messageRepo: this.messageRepoInstance,
        outboxRepo: this.outboxRepoInstance,
      });
    });
  }
}
