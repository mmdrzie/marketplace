import 'dotenv/config';
import { serve } from '@hono/node-server';
import app from './app.js';

const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[server] MISSING REQUIRED ENV: ${key}`);
    process.exit(1);
  }
}

const port = parseInt(process.env.PORT || '4000', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`[server] running at http://localhost:${port}`);
});
