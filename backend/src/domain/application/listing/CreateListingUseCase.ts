import { Listing } from '../../entities/listing/Listing.entity.js';
import { ListingRepository } from '../../entities/listing/Listing.repository.js';
import { ListingMapper } from './ListingMapper.js';
import { CreateListingCommand } from './commands/CreateListingCommand.js';
import { ListingDTO } from './ListingDTO.js';
import { TransactionManager, transactionManager as defaultTx } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter, OutboxPublisher } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';
import type { OutboxRepository } from '../../infrastructure/outbox/OutboxRepository.js';

export class CreateListingUseCase {
  private readonly outboxWriter: OutboxWriter;

  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly mapper: ListingMapper = new ListingMapper(),
    private readonly txManager: TransactionManager = defaultTx,
    outboxRepo?: OutboxRepository,
  ) {
    this.outboxWriter = new OutboxWriter(outboxRepo ?? new OutboxRepositoryImpl());
  }

  async execute(command: CreateListingCommand): Promise<ListingDTO> {
    return this.txManager.run(async () => {
      const listing = Listing.create({
        id: 0,
        userId: command.userId,
        categoryId: command.categoryId,
        provinceId: command.provinceId,
        cityId: command.cityId,
        title: command.title,
        description: command.description,
        price: command.price,
        priceType: command.priceType,
        vehicleVariantId: command.vehicleVariantId,
      });

      await this.listingRepo.save(listing);

      await this.outboxWriter.write({
        aggregateType: 'listing',
        aggregateId: String(listing.id),
        eventType: 'listing.created',
        payload: { listingId: listing.id, userId: command.userId, title: command.title },
        metadata: { correlationId: `corr-${listing.id}` },
      });

      return this.mapper.toDTO(listing);
    });
  }
}
