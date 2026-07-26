import { TransactionManager, transactionManager as defaultTx } from '../outbox/TransactionManager.js';
import type { UserRepository } from '../../entities/user/User.repository.js';
import type { OutboxRepository } from '../outbox/OutboxRepository.js';
import { OutboxRepositoryImpl } from '../outbox/OutboxRepository.impl.js';
import type { UserUnitOfWork } from './UserUnitOfWork.js';

export class UserUnitOfWorkImpl implements UserUnitOfWork {
  constructor(
    private readonly txManager: TransactionManager = defaultTx,
    private readonly userRepo: UserRepository,
    private readonly outboxRepo: OutboxRepository = new OutboxRepositoryImpl(),
  ) {}

  async execute<T>(
    fn: (uow: { userRepo: UserRepository; outboxRepo: OutboxRepository }) => Promise<T>,
  ): Promise<T> {
    return this.txManager.run(async () => {
      return fn({ userRepo: this.userRepo, outboxRepo: this.outboxRepo });
    });
  }
}
