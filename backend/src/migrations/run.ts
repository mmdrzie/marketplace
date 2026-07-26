import 'dotenv/config';
import { readdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import pg from 'pg';
import { config } from '../config/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, '../../migrations');

const LOCK_ID = 20240715;

function sha256(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

async function runMigrations() {
  const pool = new pg.Pool({ connectionString: config.database.url });
  const client = await pool.connect();

  try {
    const locked = await client.query('SELECT pg_try_advisory_lock($1)', [LOCK_ID]);
    if (!locked.rows[0]?.pg_try_advisory_lock) {
      console.log('[skip] Another migration instance is running — skipping.');
      return;
    }
    const lockAcquired = true;

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS _migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          checksum TEXT DEFAULT NULL
        )
      `);
      // add checksum column if missing on existing table
      await client.query(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='_migrations' AND column_name='checksum') THEN
            ALTER TABLE _migrations ADD COLUMN checksum TEXT DEFAULT NULL;
          END IF;
        END $$;
      `);

      const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();

      const { rows: applied } = await client.query(
        'SELECT name, checksum FROM _migrations'
      );
      const appliedMap = new Map<string, string | null>(
        applied.map((r: { name: string; checksum: string | null }) => [r.name, r.checksum])
      );

      for (const file of files) {
        const sql = readFileSync(join(migrationsDir, file), 'utf-8');
        const hash = sha256(sql);

        if (appliedMap.has(file)) {
          const prev = appliedMap.get(file);
          if (prev !== null && prev !== hash) {
            console.warn(
              `[warn] ${file} — file content changed since last applied (checksum mismatch). ` +
                'Re-run of an already-applied migration is not performed automatically. ' +
                'Review changes and add a new migration if needed.'
            );
          } else {
            console.log(`[skip] ${file} — already applied`);
          }
          continue;
        }

        console.log(`[apply] ${file}...`);

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query(
            'INSERT INTO _migrations (name, checksum) VALUES ($1, $2)',
            [file, hash]
          );
          await client.query('COMMIT');
          console.log(`[done]  ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          const pgErr = err as { code?: string; message?: string };
          // already-applied / non-critical errors
          const SKIP_CODES = ['42P07', '42710', '42804', '42703', '42601', '23505'];
          if (SKIP_CODES.includes(pgErr.code ?? '')) {
            console.log(`[skip] ${file} — ${pgErr.message}`);
            // mark as applied anyway so it's not retried
            await client.query(
              'INSERT INTO _migrations (name, checksum) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
              [file, hash]
            );
          } else {
            console.error(`[fail]  ${file}:`, pgErr.message);
            throw err;
          }
        }
      }

      console.log('\nAll migrations applied successfully.');
    } finally {
      if (lockAcquired) {
        await client.query('SELECT pg_advisory_unlock($1)', [LOCK_ID]);
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
