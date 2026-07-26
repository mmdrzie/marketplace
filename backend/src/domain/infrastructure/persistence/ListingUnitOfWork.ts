import type { ListingRepository } from '../../entities/listing/Listing.repository.js';
import type { OutboxRepository } from '../outbox/OutboxRepository.js';

export interface ListingUnitOfWork {
  execute<T>(fn: (uow: {
    listingRepo: ListingRepository;
    outboxRepo: OutboxRepository;
  }) => Promise<T>): Promise<T>;
}
