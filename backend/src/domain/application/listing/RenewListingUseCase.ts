import { ListingRepository } from '../../entities/listing/Listing.repository.js';
import { ListingMapper } from './ListingMapper.js';
import { RenewListingCommand } from './commands/RenewListingCommand.js';
import { ListingDTO } from './ListingDTO.js';
import { transactionManager } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';

export class RenewListingUseCase {
  private readonly outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly mapper: ListingMapper = new ListingMapper(),
  ) {}

  async execute(command: RenewListingCommand): Promise<ListingDTO> {
    return transactionManager.run(async () => {
      const listing = await this.listingRepo.findById(command.listingId);
      if (!listing) throw new Error('Listing not found');
      if (!listing.isOwnedBy(command.userId)) throw new Error('Forbidden');

      listing.renew();
      await this.listingRepo.save(listing);

      await this.outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(listing.id),
        eventType: 'listing.renewed',
        payload: { listingId: listing.id, userId: command.userId },
        metadata: {},
      });

      return this.mapper.toDTO(listing);
    });
  }
}
