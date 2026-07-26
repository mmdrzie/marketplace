import { config } from './index.js';
import { AsyncLocalStorage } from 'async_hooks';

export type QueryFn = (text: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;

export type DbPool = {
  query: QueryFn;
  end: () => Promise<void>;
};

let pool: DbPool | null = null;
let initPromise: Promise<DbPool> | null = null;

// AsyncLocalStorage برای ذخیره client تراکنش در همان execution context
export const txStorage = new AsyncLocalStorage<{ query: QueryFn }>();

export async function getDb(): Promise<DbPool> {
  // اگر داخل یک تراکنش هستیم، از client اختصاصی آن استفاده کن
  const txClient = txStorage.getStore();
  if (txClient) {
    return { query: txClient.query, end: async () => {} };
  }

  if (pool) return pool;
  if (!initPromise) {
    initPromise = (async () => {
      const pg = await import('pg');
      const p = new pg.Pool({
        connectionString: config.database.url,
        min: config.database.poolMin,
        max: config.database.poolMax,
        ssl: { rejectUnauthorized: false },
      });

      p.on('error', (err) => {
        console.error('[db] unexpected pool error:', err);
      });

      pool = p as unknown as DbPool;
      return pool;
    })();
  }

  return initPromise;
}

export async function getRawPool(): Promise<import('pg').Pool> {
  await getDb();
  const pg = await import('pg');
  // pool قبلاً مقداردهی شده
  return pool as unknown as import('pg').Pool;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    initPromise = null;
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.query('SELECT 1');
    return true;
  } catch (e: unknown) {
    const dbErr = e as { code?: string; message?: string } | null;
    console.error('[db] connection check failed:', dbErr?.code, dbErr?.message);
    return false;
  }
}
