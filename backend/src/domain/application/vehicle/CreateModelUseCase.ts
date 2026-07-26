import { VehicleModel } from '../../entities/vehicle/VehicleModel.entity.js';
import { VehicleRepository } from '../../entities/vehicle/Vehicle.repository.js';
import { ModelMapper } from './ModelMapper.js';
import { CreateModelCommand } from './commands/CreateModelCommand.js';
import { ModelDTO } from './ModelDTO.js';
import { transactionManager } from '../../infrastructure/outbox/TransactionManager.js';
import { OutboxWriter } from '../../infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../../infrastructure/outbox/OutboxRepository.impl.js';

export class CreateModelUseCase {
  private readonly outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

  constructor(
    private readonly vehicleRepo: VehicleRepository,
    private readonly mapper: ModelMapper = new ModelMapper(),
  ) {}

  async execute(command: CreateModelCommand): Promise<ModelDTO> {
    return transactionManager.run(async () => {
      const brand = await this.vehicleRepo.findBrandById(command.brandId);
      if (!brand) throw new Error('Brand not found');

      const model = VehicleModel.create({
        id: 0, brandId: command.brandId, name: command.name, nameEn: command.nameEn,
        slug: command.slug, segment: command.segment, generation: command.generation,
        bodyType: command.bodyType, yearFrom: command.yearFrom, yearTo: command.yearTo,
      });

      await this.vehicleRepo.saveModel(model);

      await this.outboxWriter.write({
        aggregateType: 'model', aggregateId: String(model.id),
        eventType: 'model.created',
        payload: { modelId: model.id, brandId: model.brandId, name: model.name },
        metadata: {},
      });

      return this.mapper.toDTO(model);
    });
  }
}
