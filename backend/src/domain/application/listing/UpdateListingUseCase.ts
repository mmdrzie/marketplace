import { ListingRepository } from '../../entities/listing/Listing.repository.js';
import { ListingMapper } from './ListingMapper.js';
import { UpdateListingCommand } from './commands/UpdateListingCommand.js';
import { ListingDTO } from './ListingDTO.js';
import { Money } from '../../entities/value-objects/Money.js';
import { parsePriceType } from '../../entities/value-objects/PriceType.js';
import { transactionManager } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';

export class UpdateListingUseCase {
  private readonly outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

  constructor(
    private readonly listingRepo: ListingRepository,
    private readonly mapper: ListingMapper = new ListingMapper(),
  ) {}

  async execute(command: UpdateListingCommand): Promise<ListingDTO> {
    return transactionManager.run(async () => {
      const listing = await this.listingRepo.findById(command.listingId);
      if (!listing) throw new Error('Listing not found');
      if (!listing.isOwnedBy(command.userId)) throw new Error('Forbidden');

      const changes: string[] = [];
      const props: Record<string, unknown> = {};

      if (command.title !== undefined) { props.title = command.title; changes.push('title'); }
      if (command.description !== undefined) { props.description = command.description; changes.push('description'); }
      if (command.price !== undefined) { props.price = Money.fromToman(command.price); changes.push('price'); }
      if (command.priceType !== undefined) { props.priceType = parsePriceType(command.priceType); changes.push('priceType'); }
      if (command.categoryId !== undefined) { props.categoryId = command.categoryId; changes.push('categoryId'); }
      if (command.provinceId !== undefined) { props.provinceId = command.provinceId; changes.push('provinceId'); }
      if (command.cityId !== undefined) { props.cityId = command.cityId; changes.push('cityId'); }
      if (command.vehicleVariantId !== undefined) { props.vehicleVariantId = command.vehicleVariantId; changes.push('vehicleVariantId'); }

      listing.update(props as Parameters<typeof listing.update>[0]);
      await this.listingRepo.save(listing);

      await this.outboxWriter.write({
        aggregateType: 'listing',
        aggregateId: String(listing.id),
        eventType: 'listing.updated',
        payload: { listingId: listing.id, userId: command.userId, changes },
        metadata: {},
      });

      return this.mapper.toDTO(listing);
    });
  }
}
