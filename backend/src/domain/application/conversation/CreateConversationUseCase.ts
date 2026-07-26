import { Conversation } from '../../entities/conversation/Conversation.entity.js';
import { OutboxEvent } from '../../infrastructure/outbox/OutboxEvent.entity.js';
import { ConversationMapper, conversationMapper } from './ConversationMapper.js';
import { CreateConversationCommand } from './commands/CreateConversationCommand.js';
import { ConversationDTO } from './ConversationDTO.js';
import type { UnitOfWork } from '../../infrastructure/persistence/UnitOfWork.js';

export class CreateConversationUseCase {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly mapper: ConversationMapper = conversationMapper,
  ) {}

  async execute(command: CreateConversationCommand): Promise<ConversationDTO> {
    return this.uow.execute(async ({ conversationRepo, outboxRepo }) => {
      const existing = await conversationRepo.findByListingAndSellerBuyer(
        command.listingId,
        command.buyerId,
        command.sellerId,
      );

      if (existing) {
        return this.mapper.toDTO(existing);
      }

      const conversation = Conversation.create({
        id: 0,
        listingId: command.listingId,
        buyerId: command.buyerId,
        sellerId: command.sellerId,
      });

      await conversationRepo.save(conversation, 1);

      const outboxEvent = OutboxEvent.create({
        aggregateType: 'conversation',
        aggregateId: String(conversation.id),
        eventType: 'conversation.started',
        payload: {
          conversationId: conversation.id,
          listingId: conversation.listingId,
          buyerId: conversation.buyerId,
          sellerId: conversation.sellerId,
        },
        metadata: {
          correlationId: `conv-${conversation.id}`,
        },
      });

      await outboxRepo.save(outboxEvent);

      return this.mapper.toDTO(conversation);
    });
  }
}
