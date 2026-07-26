import { Brand } from '../../entities/vehicle/Brand.entity.js';
import { VehicleRepository } from '../../entities/vehicle/Vehicle.repository.js';
import { BrandMapper } from './BrandMapper.js';
import { CreateBrandCommand } from './commands/CreateBrandCommand.js';
import { BrandDTO } from './BrandDTO.js';
import { transactionManager } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';

export class CreateBrandUseCase {
  private readonly outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

  constructor(
    private readonly vehicleRepo: VehicleRepository,
    private readonly mapper: BrandMapper = new BrandMapper(),
  ) {}

  async execute(command: CreateBrandCommand): Promise<BrandDTO> {
    return transactionManager.run(async () => {
      const brand = Brand.create({
        id: 0, name: command.name, nameEn: command.nameEn, slug: command.slug,
        logo: command.logo, country: command.country, foundedYear: command.foundedYear,
        website: command.website, description: command.description,
      });

      await this.vehicleRepo.saveBrand(brand);

      await this.outboxWriter.write({
        aggregateType: 'brand', aggregateId: String(brand.id),
        eventType: 'brand.created',
        payload: { brandId: brand.id, name: brand.name },
        metadata: {},
      });

      return this.mapper.toDTO(brand);
    });
  }
}
