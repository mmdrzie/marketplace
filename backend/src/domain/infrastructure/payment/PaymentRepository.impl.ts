import { getDb } from '../../../config/database.js';
import { Payment } from '../../entities/payment/Payment.entity.js';
import type { PaymentRepository } from '../../entities/payment/Payment.repository.js';

export class PaymentRepositoryImpl implements PaymentRepository {
  async findById(id: number): Promise<Payment | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (!rows.length) return null;
    return Payment.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByUser(userId: string): Promise<Payment[]> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC', [userId],
    );
    return (rows as Record<string, unknown>[]).map(r => Payment.fromSnapshot(this.toSnapshot(r)));
  }

  async save(payment: Payment): Promise<void> {
    const db = await getDb();
    const s = payment.snapshot();

    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO payments (user_id, amount, currency, gateway, provider, status, reference_id, provider_id, description, metadata, paid_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [s.userId, s.amount, s.currency, s.gateway, s.provider, s.status, s.referenceId, s.providerId, s.description, s.metadata ? JSON.stringify(s.metadata) : null, s.paidAt],
      );
      (payment as any).id = (rows[0] as Record<string, unknown>).id;
    } else {
      await db.query(
        `UPDATE payments SET status=$1, reference_id=$2, provider_id=$3, paid_at=$4, metadata=$5, updated_at=NOW() WHERE id=$6`,
        [s.status, s.referenceId, s.providerId, s.paidAt, s.metadata ? JSON.stringify(s.metadata) : null, s.id],
      );
    }
  }

  private toSnapshot(r: Record<string, unknown>) {
    return {
      id: r.id as number, userId: r.user_id as string, amount: r.amount as number,
      currency: (r.currency as string) ?? 'IRR',
      gateway: (r.gateway as 'zarinpal' | 'internal') ?? 'zarinpal',
      provider: r.provider as string | null,
      status: r.status as 'pending' | 'completed' | 'failed' | 'refunded',
      referenceId: r.reference_id as string | null,
      providerId: r.provider_id as string | null,
      description: r.description as string | null,
      metadata: r.metadata ? (typeof r.metadata === 'string' ? JSON.parse(r.metadata as string) : r.metadata) as Record<string, unknown> : null,
      paidAt: r.paid_at as string | null,
      createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    };
  }
}
