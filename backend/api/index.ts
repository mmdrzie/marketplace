import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { corsMiddleware } from '../src/middleware/cors.js';
import { rateLimiter } from '../src/middleware/rateLimiter.js';
import { apiRouter } from '../src/routes/index.js';
import { config } from '../src/config/index.js';
import { ErrorCode } from '../src/shared/index.js';

const app = new Hono();

app.use('*', corsMiddleware());
app.use('/api/*', rateLimiter('global'));

app.onError((err, c) => {
  if (err && typeof err === 'object' && 'code' in err && 'httpStatus' in err) {
    return c.json(
      { success: false, error: { code: err.code, message: err.message } },
      err.httpStatus,
    );
  }
  console.error('[error] unhandled:', err);
  return c.json(
    { success: false, error: { code: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' } },
    500,
  );
});

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