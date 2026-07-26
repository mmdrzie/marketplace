import { ListingRepository } from '../../entities/listing/Listing.repository.js';
import { ListingMapper } from './ListingMapper.js';
import { SubmitListingCommand } from './commands/SubmitListingCommand.js';
import { ListingDTO } from './ListingDTO.js';
import { transactionManager } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';

export class SubmitListingUseCase {
  private readonly outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly mapper: ListingMapper = new ListingMapper(),
  ) {}

  async execute(command: SubmitListingCommand): Promise<ListingDTO> {
    return transactionManager.run(async () => {
      const listing = await this.listingRepo.findById(command.listingId);
      if (!listing) throw new Error('Listing not found');
      if (!listing.isOwnedBy(command.userId)) throw new Error('Forbidden');

      const oldStatus = listing.status;
      listing.submit();
      await this.listingRepo.save(listing);

      await this.outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(listing.id),
        eventType: 'listing.submitted',
        payload: { listingId: listing.id, userId: command.userId, oldStatus, newStatus: listing.status },
        metadata: {},
      });

      return this.mapper.toDTO(listing);
    });
  }
}
