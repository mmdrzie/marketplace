import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { apiRouter } from './routes/index.js';
import { config } from './config/index.js';
import { AppError } from './errors.js';
import { ErrorCode } from './shared/index.js';

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
