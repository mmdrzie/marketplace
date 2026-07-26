// Integration test setup — requires DATABASE_URL to be set
// Run: npx vitest run --config vitest.integration.ts

import { beforeAll, afterAll } from 'vitest';

const DB_URL = process.env.DATABASE_URL;

export function skipIfNoDb() {
  // describe.runIf runs tests when condition is true
  return !!DB_URL && !DB_URL.includes('USER:PASSWORD');
}

export function getDbConfig() {
  return {
    connectionString: DB_URL,
    ssl: DB_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  };
}
