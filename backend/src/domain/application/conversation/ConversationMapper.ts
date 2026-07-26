import { Conversation } from '../../entities/conversation/Conversation.entity.js';
import { ConversationDTO } from './ConversationDTO.js';

export class ConversationMapper {
  toDTO(conversation: Conversation): ConversationDTO {
    const s = conversation.snapshot();
    return new ConversationDTO(
      s.id,
      s.listingId,
      s.buyerId,
      s.sellerId,
      s.status,
      s.lastMessageId,
      s.lastMessageAt,
      s.createdAt,
      s.updatedAt,
    );
  }
}

export const conversationMapper = new ConversationMapper();
