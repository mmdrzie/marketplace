import { MarkReadCommand } from './commands/MarkReadCommand.js';
import type { UnitOfWork } from '../../infrastructure/persistence/UnitOfWork.js';

export class MarkReadUseCase {
  constructor(
    private readonly uow: UnitOfWork,
  ) {}

  async execute(command: MarkReadCommand): Promise<void> {
    return this.uow.execute(async ({ conversationRepo, messageRepo }) => {
      const conversation = await conversationRepo.findById(command.conversationId);
      if (!conversation) {
        throw new Error(`Conversation ${command.conversationId} not found`);
      }
      if (!conversation.isParticipant(command.userId)) {
        throw new Error('User is not a participant of this conversation');
      }

      await messageRepo.markRead(command.conversationId, command.userId);
    });
  }
}
