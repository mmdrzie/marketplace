import { config } from './index.js';

export type DbPool = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[]; rowCount: number }>;
  end: () => Promise<void>;
};

let pool: DbPool | null = null;

export async function getDb(): Promise<DbPool> {
  if (pool) return pool;

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
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
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
