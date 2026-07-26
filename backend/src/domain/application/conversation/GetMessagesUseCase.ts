import { MessageMapper, messageMapper } from './MessageMapper.js';
import { GetMessagesCommand } from './commands/GetMessagesCommand.js';
import { MessageDTO } from './MessageDTO.js';
import type { ConversationRepository } from '../../entities/conversation/Conversation.repository.js';
import type { MessageRepository } from '../../entities/conversation/Message.repository.js';

export class GetMessagesUseCase {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly messageRepo: MessageRepository,
    private readonly mapper: MessageMapper = messageMapper,
  ) {}

  async execute(command: GetMessagesCommand): Promise<MessageDTO[]> {
    const conversation = await this.conversationRepo.findById(command.conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${command.conversationId} not found`);
    }
    if (!conversation.isParticipant(command.userId)) {
      throw new Error('User is not a participant of this conversation');
    }

    const result = await this.messageRepo.findByConversation(
      command.conversationId,
      command.cursor,
      command.limit,
    );

    return result.messages.map(m => this.mapper.toDTO(m));
  }
}
