import { getDb } from '../config/database.js';

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
  async create(data: {
    user_id: string;
    amount: number;
    currency?: string;
    provider?: string;
    metadata?: Record<string, unknown>;
  }) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO payments (user_id, amount, currency, provider, metadata)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.user_id, data.amount, data.currency ?? 'IRR', data.provider ?? 'noop', JSON.stringify(data.metadata ?? {})],
    );
    return rows[0] as PaymentRow;
  }

  async update(id: number, data: { status?: string; provider_id?: string; metadata?: Record<string, unknown> }) {
    const fields: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
    if (data.provider_id !== undefined) { fields.push(`provider_id = $${idx++}`); values.push(data.provider_id); }
    if (data.metadata) { fields.push(`metadata = $${idx++}`); values.push(JSON.stringify(data.metadata)); }

    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE payments SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] as PaymentRow | undefined;
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
}

export const paymentRepo = new PaymentRepository();
