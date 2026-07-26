import { DomainError } from './DomainError.js';

export class ConversationNotFoundError extends DomainError {
  readonly code = 'CONVERSATION_NOT_FOUND';
  constructor(id: number) {
    super(`Conversation ${id} not found`, { conversationId: id });
  }
}

export class ConversationLockedError extends DomainError {
  readonly code = 'CONVERSATION_LOCKED';
  constructor(id: number) {
    super(`Conversation ${id} is locked`, { conversationId: id });
  }
}

export class ConversationDeletedError extends DomainError {
  readonly code = 'CONVERSATION_DELETED';
  constructor(id: number) {
    super(`Conversation ${id} has been deleted`, { conversationId: id });
  }
}

export class NotParticipantError extends DomainError {
  readonly code = 'NOT_PARTICIPANT';
  constructor(conversationId: number) {
    super('You are not a participant in this conversation', { conversationId });
  }
}

export class UserBlockedError extends DomainError {
  readonly code = 'USER_BLOCKED';
  constructor() {
    super('You have been blocked by this user');
  }
}

export class SelfMessageError extends DomainError {
  readonly code = 'SELF_MESSAGE';
  constructor() {
    super('You cannot start a conversation with yourself');
  }
}

export class ConversationNotActiveError extends DomainError {
  readonly code = 'CONVERSATION_NOT_ACTIVE';
  constructor(id: number, status: string) {
    super(`Conversation ${id} is not active (status: ${status})`, { conversationId: id, status });
  }
}
