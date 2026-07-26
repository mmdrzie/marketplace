import { ListingRepository } from '../../entities/listing/Listing.repository.js';
import { DeleteListingCommand } from './commands/DeleteListingCommand.js';
import { transactionManager } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';

export class DeleteListingUseCase {
  private readonly outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

  constructor(private readonly listingRepo: ListingRepository) {}

  async execute(command: DeleteListingCommand): Promise<void> {
    return transactionManager.run(async () => {
      const listing = await this.listingRepo.findById(command.listingId);
      if (!listing) throw new Error('Listing not found');
      if (!listing.isOwnedBy(command.userId)) throw new Error('Forbidden');

      listing.softDelete();
      await this.listingRepo.save(listing);

      await this.outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(listing.id),
        eventType: 'listing.deleted',
        payload: { listingId: listing.id, userId: command.userId },
        metadata: {},
      });
    });
  }
}
