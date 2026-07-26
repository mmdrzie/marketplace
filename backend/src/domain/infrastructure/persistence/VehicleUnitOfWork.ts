import type { VehicleRepository } from '../../entities/vehicle/Vehicle.repository.js';
import type { OutboxRepository } from '../outbox/OutboxRepository.js';

export interface VehicleUnitOfWork {
  execute<T>(fn: (uow: {
    vehicleRepo: VehicleRepository;
    outboxRepo: OutboxRepository;
  }) => Promise<T>): Promise<T>;
}
