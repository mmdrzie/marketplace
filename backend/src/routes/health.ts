import { Hono } from 'hono';
import { healthChecker } from '../domain/infrastructure/health/HealthChecker.js';
import { checkConnection } from '../config/database.js';

const router = new Hono();

// Register built-in health checks
healthChecker.addCheck('database', async () => checkConnection());
healthChecker.addCheck('uptime', async () => {
  return process.uptime() > 0;
});

router.get('/', async (c) => {
  const result = await healthChecker.check();
  const statusCode = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;
  return c.json({
    success: result.status === 'healthy',
    data: result,
  }, statusCode);
});

router.get('/live', (c) => {
  return c.json({ status: 'alive', uptime: process.uptime() });
});

router.get('/ready', async (c) => {
  const db = await checkConnection();
  return c.json({ status: db ? 'ready' : 'not ready', db: db ? 'connected' : 'disconnected' });
});

export { router as healthRouter };
