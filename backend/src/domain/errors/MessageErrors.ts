import { DomainError } from './DomainError.js';

export class MessageNotFoundError extends DomainError {
  readonly code = 'MESSAGE_NOT_FOUND';
  constructor(id: number) {
    super(`Message ${id} not found`, { messageId: id });
  }
}

export class MessageDeletedError extends DomainError {
  readonly code = 'MESSAGE_DELETED';
  constructor(id: number) {
    super(`Message ${id} has been deleted`, { messageId: id });
  }
}

export class CannotEditDeletedMessageError extends DomainError {
  readonly code = 'CANNOT_EDIT_DELETED';
  constructor() {
    super('Cannot edit a deleted message');
  }
}

export class OptimisticLockError extends DomainError {
  readonly code = 'OPTIMISTIC_LOCK';
  readonly retryable = true;
  constructor(resource: string, id: number) {
    super(`${resource} ${id} was modified by another request`, { resource, resourceId: id });
  }
}

export class MessageTooLongError extends DomainError {
  readonly code = 'MESSAGE_TOO_LONG';
  constructor(maxLength: number) {
    super(`Message exceeds maximum length of ${maxLength} characters`, { maxLength });
  }
}

export class EmptyMessageError extends DomainError {
  readonly code = 'EMPTY_MESSAGE';
  constructor() {
    super('Message body cannot be empty');
  }
}
