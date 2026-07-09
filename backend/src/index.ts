import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { apiRouter } from './routes';
import { config } from './config';
import { AppError } from './errors';
import { ErrorCode } from './shared';

const app = new Hono();

app.use('*', corsMiddleware());
app.use('*', errorHandler());
app.use('/api/*', rateLimiter('global'));

app.route(config.apiPrefix, apiRouter);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: { code: ErrorCode.NOT_FOUND, message: `Route not found: ${c.req.method} ${c.req.path}` },
    },
    404,
  );
});

export default app;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const serve = async () => {
    const { serve: honoServe } = await import('@hono/node-server');
    honoServe({
      fetch: app.fetch,
      port: config.port,
    }, (info) => {
      console.log(`[server] running on http://localhost:${info.port}${config.apiPrefix}`);
    });
  };
  serve();
}
