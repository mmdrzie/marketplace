import { ConversationRepository } from '../../entities/conversation/Conversation.repository.js';
import { ConversationMapper, conversationMapper } from './ConversationMapper.js';
import { GetConversationsCommand } from './commands/GetConversationsCommand.js';
import { ConversationDTO } from './ConversationDTO.js';

export class GetConversationsUseCase {
  constructor(
    private readonly conversationRepo: ConversationRepository,
    private readonly mapper: ConversationMapper = conversationMapper,
  ) {}

  async execute(command: GetConversationsCommand): Promise<ConversationDTO[]> {
    const conversations = await this.conversationRepo.findConversationsByUser(command.userId);
    return conversations.map(c => this.mapper.toDTO(c));
  }
}
