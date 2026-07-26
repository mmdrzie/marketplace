import { VehicleVariant } from '../../entities/vehicle/VehicleVariant.entity.js';
import { VehicleRepository } from '../../entities/vehicle/Vehicle.repository.js';
import { VariantMapper } from './VariantMapper.js';
import { CreateVariantCommand } from './commands/CreateVariantCommand.js';
import { VariantDTO } from './VariantDTO.js';
import { transactionManager } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';

export class CreateVariantUseCase {
  private readonly outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

  constructor(
    private readonly vehicleRepo: VehicleRepository,
    private readonly mapper: VariantMapper = new VariantMapper(),
  ) {}

  async execute(command: CreateVariantCommand): Promise<VariantDTO> {
    return transactionManager.run(async () => {
      const model = await this.vehicleRepo.findModelById(command.modelId);
      if (!model) throw new Error('Model not found');

      const variant = VehicleVariant.create({
        id: 0, modelId: command.modelId, name: command.name, nameEn: command.nameEn, slug: command.slug,
      });

      await this.vehicleRepo.saveVariant(variant);

      await this.outboxWriter.write({
        aggregateType: 'variant', aggregateId: String(variant.id),
        eventType: 'variant.created',
        payload: { variantId: variant.id, modelId: variant.modelId, name: variant.name },
        metadata: {},
      });

      return this.mapper.toDTO(variant);
    });
  }
}
