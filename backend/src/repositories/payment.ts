import { getDb } from '../config/database.js';
import { config } from '../config/index.js';
import { Payment } from '../domain/entities/payment/Payment.entity.js';
import { PaymentRepositoryImpl } from '../domain/infrastructure/payment/PaymentRepository.impl.js';

export interface PaymentRow {
  id: number;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  provider_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WalletTransactionRow {
  id: number;
  user_id: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: number | null;
  description: string;
  created_at: string;
}

export class PaymentRepository {
  private _domainImpl: PaymentRepositoryImpl;

  constructor(domainImpl?: PaymentRepositoryImpl) {
    this._domainImpl = domainImpl ?? new PaymentRepositoryImpl();
  }

  async create(data: {
    user_id: string;
    amount: number;
    currency?: string;
    provider?: string;
    metadata?: Record<string, unknown>;
  }) {
    const payment = Payment.fromSnapshot({
      id: 0,
      userId: data.user_id,
      amount: data.amount,
      currency: data.currency ?? 'IRR',
      gateway: 'zarinpal',
      provider: data.provider ?? config.payment.provider,
      status: 'pending',
      referenceId: null,
      providerId: null,
      description: null,
      metadata: data.metadata ?? null,
      paidAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this._domainImpl.save(payment);
    const created = await this._domainImpl.findById(payment.id);
    return this.snapshotToRow((created ?? payment).snapshot());
  }

  async update(id: number, data: { status?: string; provider_id?: string; metadata?: Record<string, unknown> }) {
    const existing = await this._domainImpl.findById(id);
    if (!existing) return undefined;

    if (data.status) existing.status = data.status as any;
    if (data.provider_id !== undefined) existing.providerId = data.provider_id;
    if (data.metadata) existing.metadata = data.metadata;

    await this._domainImpl.save(existing);
    const updated = await this._domainImpl.findById(id);
    return updated ? this.snapshotToRow(updated.snapshot()) : undefined;
  }

  async addWalletTransaction(data: {
    user_id: string;
    type: string;
    amount: number;
    balance_before: number;
    description?: string;
    reference_type?: string;
    reference_id?: number;
  }) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO wallet_transactions (user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.user_id, data.type, data.amount, data.balance_before, data.balance_before + data.amount, data.description ?? '', data.reference_type ?? null, data.reference_id ?? null],
    );
    return rows[0] as WalletTransactionRow;
  }

  async getWalletTransactions(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId],
    );
    return rows as WalletTransactionRow[];
  }

  async getWalletBalance(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as balance FROM wallet_transactions WHERE user_id = $1`,
      [userId],
    );
    return parseInt((rows[0] as { balance: string }).balance, 10);
  }

  private snapshotToRow(s: import('../domain/entities/payment/Payment.entity.js').PaymentSnapshot): PaymentRow {
    return {
      id: s.id,
      user_id: s.userId,
      amount: s.amount,
      currency: s.currency,
      status: s.status,
      provider: s.provider ?? '',
      provider_id: s.providerId,
      metadata: s.metadata ?? {},
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    };
  }
}

export const paymentRepo = new PaymentRepository();
