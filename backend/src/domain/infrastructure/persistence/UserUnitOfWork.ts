import type { UserRepository } from '../../entities/user/User.repository.js';
import type { OutboxRepository } from '../outbox/OutboxRepository.js';

export interface UserUnitOfWork {
  execute<T>(fn: (uow: {
    userRepo: UserRepository;
    outboxRepo: OutboxRepository;
  }) => Promise<T>): Promise<T>;
}
