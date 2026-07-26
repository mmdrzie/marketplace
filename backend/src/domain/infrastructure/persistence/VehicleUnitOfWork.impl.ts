import { TransactionManager, transactionManager as defaultTx } from '../outbox/TransactionManager.js';
import type { VehicleRepository } from '../../entities/vehicle/Vehicle.repository.js';
import type { OutboxRepository } from '../outbox/OutboxRepository.js';
import { OutboxRepositoryImpl } from '../outbox/OutboxRepository.impl.js';
import type { VehicleUnitOfWork } from './VehicleUnitOfWork.js';

export class VehicleUnitOfWorkImpl implements VehicleUnitOfWork {
  constructor(
    private readonly txManager: TransactionManager = defaultTx,
    private readonly vehicleRepo: VehicleRepository,
    private readonly outboxRepo: OutboxRepository = new OutboxRepositoryImpl(),
  ) {}

  async execute<T>(
    fn: (uow: { vehicleRepo: VehicleRepository; outboxRepo: OutboxRepository }) => Promise<T>,
  ): Promise<T> {
    return this.txManager.run(async () => {
      return fn({ vehicleRepo: this.vehicleRepo, outboxRepo: this.outboxRepo });
    });
  }
}
