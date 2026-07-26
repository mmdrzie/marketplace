import { ListingRepository } from '../../entities/listing/Listing.repository.js';
import { ListingMapper } from './ListingMapper.js';
import { ApproveListingCommand } from './commands/ApproveListingCommand.js';
import { ListingDTO } from './ListingDTO.js';
import { transactionManager } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';

export class ApproveListingUseCase {
  private readonly outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly mapper: ListingMapper = new ListingMapper(),
  ) {}

  async execute(command: ApproveListingCommand): Promise<ListingDTO> {
    return transactionManager.run(async () => {
      const listing = await this.listingRepo.findById(command.listingId);
      if (!listing) throw new Error('Listing not found');

      const oldStatus = listing.status;
      listing.approve();
      await this.listingRepo.save(listing);

      await this.outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(listing.id),
        eventType: 'listing.approved',
        payload: { listingId: listing.id, adminUserId: command.adminUserId, oldStatus, newStatus: listing.status },
        metadata: {},
      });

      return this.mapper.toDTO(listing);
    });
  }
}
