import { Message } from '../../entities/conversation/Message.entity.js';
import { OutboxEvent } from '../../infrastructure/outbox/OutboxEvent.entity.js';
import { MessageMapper, messageMapper } from './MessageMapper.js';
import { SendMessageCommand } from './commands/SendMessageCommand.js';
import { MessageDTO } from './MessageDTO.js';
import type { UnitOfWork } from '../../infrastructure/persistence/UnitOfWork.js';

export class SendMessageUseCase {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly mapper: MessageMapper = messageMapper,
  ) {}

  async execute(command: SendMessageCommand): Promise<MessageDTO> {
    return this.uow.execute(async ({ conversationRepo, messageRepo, outboxRepo }) => {
      const conversation = await conversationRepo.findById(command.conversationId);
      if (!conversation) {
        throw new Error(`Conversation ${command.conversationId} not found`);
      }
      if (!conversation.isParticipant(command.senderId)) {
        throw new Error('Sender is not a participant of this conversation');
      }
      if (!conversation.isActive()) {
        throw new Error('Conversation is not active');
      }

      const message = Message.create({
        id: 0,
        conversationId: command.conversationId,
        senderId: command.senderId,
        body: command.body,
        type: command.type,
      });

      const saved = await messageRepo.addMessage(message);

      conversation.updateLastMessage(saved.id);
      await conversationRepo.save(conversation, conversation.version);

      const outboxEvent = OutboxEvent.create({
        aggregateType: 'message',
        aggregateId: String(saved.id),
        eventType: 'message.sent',
        payload: {
          messageId: saved.id,
          conversationId: command.conversationId,
          senderId: command.senderId,
          body: command.body,
          type: command.type ?? 'text',
        },
        metadata: {
          correlationId: `msg-${saved.id}`,
        },
      });

      await outboxRepo.save(outboxEvent);

      return this.mapper.toDTO(saved);
    });
  }
}
