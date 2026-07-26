import 'dotenv/config';
import { serve, type ServerType } from '@hono/node-server';
import app from './app.js';
import { OutboxWorker } from './domain/infrastructure/outbox/OutboxWorker.js';
import { closeDb } from './config/database.js';

const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'] as const;
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[server] MISSING REQUIRED ENV: ${key}`);
    process.exit(1);
  }
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('[server] JWT_SECRET must be at least 32 characters long');
  process.exit(1);
}

const port = parseInt(process.env.PORT || '4000', 10);

const outboxWorker = new OutboxWorker();

const server: ServerType = serve({ fetch: app.fetch, port }, () => {
  console.log(`[server] running at http://localhost:${port}`);
  outboxWorker.start();
});

async function gracefulShutdown(signal: string) {
  console.log(`[server] ${signal} received, shutting down gracefully...`);
  outboxWorker.stop();
  server.close(() => {
    console.log('[server] HTTP server closed');
  });
  try {
    await closeDb();
    console.log('[server] database pool closed');
  } catch (err) {
    console.error('[server] error closing database pool:', err);
  }
  process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
