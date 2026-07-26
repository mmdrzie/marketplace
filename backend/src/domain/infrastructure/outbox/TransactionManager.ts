import { getRawPool, txStorage } from '../../../config/database.js';

export interface UnitOfWork {
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export class TransactionManager {
  async begin<T>(fn: () => Promise<T>): Promise<T> {
    const pool = await getRawPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const txDb = { query: client.query.bind(client) };

      return await txStorage.run(txDb, async () => {
        try {
          const result = await fn();
          await client.query('COMMIT');
          return result;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      });
    } finally {
      client.release();
    }
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    return this.begin(fn);
  }
}

export const transactionManager = new TransactionManager();
