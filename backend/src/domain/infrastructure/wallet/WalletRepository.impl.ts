import { getDb } from '../../../config/database.js';
import { WalletTransaction } from '../../entities/wallet/WalletTransaction.entity.js';
import type { WalletRepository, AddTransactionInput } from '../../entities/wallet/Wallet.repository.js';

export class WalletRepositoryImpl implements WalletRepository {
  async addAtomicTransaction(input: AddTransactionInput): Promise<WalletTransaction | null> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO wallet_transactions (user_id, type, amount, balance_before, balance_after, description, reference_type, reference_id, created_at)
       SELECT $1, $2, $3,
              COALESCE(SUM(wt.amount), 0),
              COALESCE(SUM(wt.amount), 0) + $3,
              $4, $5, $6, NOW()
       FROM wallet_transactions wt
       WHERE wt.user_id = $1
         AND NOT EXISTS (
           SELECT 1 FROM wallet_transactions wt2
           WHERE wt2.user_id = $1 AND wt2.reference_type = $5 AND wt2.reference_id = $6
         )
         AND (COALESCE(SUM(wt.amount), 0) + $3) >= 0
       RETURNING *`,
      [input.userId, input.type, input.amount, input.description, input.referenceType, input.referenceId],
    );
    if (!rows.length) return null;
    return this.toEntity(rows[0] as Record<string, unknown>);
  }

  async hasReference(referenceType: string, referenceId: number): Promise<boolean> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT 1 FROM wallet_transactions WHERE reference_type = $1 AND reference_id = $2 LIMIT 1',
      [referenceType, referenceId],
    );
    return rows.length > 0;
  }

  async getBalance(userId: string): Promise<number> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as balance FROM wallet_transactions WHERE user_id = $1`,
      [userId],
    );
    return parseInt((rows[0] as { balance: string }).balance, 10);
  }

  async getTransactions(userId: string): Promise<WalletTransaction[]> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId],
    );
    return (rows as Record<string, unknown>[]).map(r => this.toEntity(r));
  }

  private toEntity(r: Record<string, unknown>): WalletTransaction {
    return WalletTransaction.fromSnapshot({
      id: r.id as number,
      userId: r.user_id as string,
      type: r.type as string,
      amount: r.amount as number,
      balanceBefore: r.balance_before as number,
      balanceAfter: r.balance_after as number,
      referenceType: r.reference_type as string | null,
      referenceId: r.reference_id as number | null,
      description: r.description as string,
      createdAt: r.created_at as string,
    });
  }
}
