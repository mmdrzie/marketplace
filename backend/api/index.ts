import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { corsMiddleware } from '../src/middleware/cors.js';
import { rateLimiter } from '../src/middleware/rateLimiter.js';
import { errorWrapper } from '../src/middleware/errorWrapper.js';
import { apiRouter } from '../src/routes/index.js';
import { docsRouter } from '../src/routes/docs.js';
import { config } from '../src/config/index.js';
import { ErrorCode } from '../src/shared/index.js';

const app = new Hono();

app.use('*', corsMiddleware());
app.use('*', errorWrapper());
app.use('/api/*', rateLimiter('global'));

app.route('/api/v1', docsRouter);
app.route(config.apiPrefix, apiRouter);

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: { code: ErrorCode.NOT_FOUND, message: `Route not found: ${c.req.method} ${c.req.path}` },
    },
    404,
  );
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);