import { Hono } from 'hono';
import { checkConnection } from '../config/database.js';

const router = new Hono();

router.get('/', async (c) => {
  const dbConnected = await checkConnection();
  return c.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: dbConnected ? 'connected' : 'disconnected',
    },
  });
});

export { router as healthRouter };
