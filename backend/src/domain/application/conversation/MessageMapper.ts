import { Message } from '../../entities/conversation/Message.entity.js';
import { MessageDTO } from './MessageDTO.js';

export class MessageMapper {
  toDTO(message: Message): MessageDTO {
    const s = message.snapshot();
    return new MessageDTO(
      s.id,
      s.conversationId,
      s.senderId,
      s.body,
      s.type,
      s.deliveryStatus,
      s.createdAt,
      s.readAt,
    );
  }
}

export const messageMapper = new MessageMapper();
