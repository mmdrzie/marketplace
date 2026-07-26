import { Payment } from './Payment.entity.js';

export interface PaymentRepository {
  findById(id: number): Promise<Payment | null>;
  findByUser(userId: string): Promise<Payment[]>;
  save(payment: Payment): Promise<void>;
}
