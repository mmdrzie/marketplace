import { TransactionManager, transactionManager as defaultTx } from '../outbox/TransactionManager.js';
import type { ListingRepository } from '../../entities/listing/Listing.repository.js';
import type { OutboxRepository } from '../outbox/OutboxRepository.js';
import { OutboxRepositoryImpl } from '../outbox/OutboxRepository.impl.js';
import type { ListingUnitOfWork } from './ListingUnitOfWork.js';

export class ListingUnitOfWorkImpl implements ListingUnitOfWork {
  constructor(
    private readonly txManager: TransactionManager = defaultTx,
    private readonly listingRepo: ListingRepository,
    private readonly outboxRepo: OutboxRepository = new OutboxRepositoryImpl(),
  ) {}

  async execute<T>(
    fn: (uow: { listingRepo: ListingRepository; outboxRepo: OutboxRepository }) => Promise<T>,
  ): Promise<T> {
    return this.txManager.run(async () => {
      return fn({ listingRepo: this.listingRepo, outboxRepo: this.outboxRepo });
    });
  }
}
