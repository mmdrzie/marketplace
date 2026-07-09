import app from './app';
import { config } from './config';

const { serve } = await import('@hono/node-server');
serve({
  fetch: app.fetch,
  port: config.port,
}, (info) => {
  console.log(`[server] running on http://localhost:${info.port}${config.apiPrefix}`);
});