import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
import { bodyLimit } from 'hono/body-limit';
import { corsMiddleware } from './middleware/cors.js';
import { errorWrapper } from './middleware/errorWrapper.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { securityHeaders } from './middleware/security.js';
import { requestId } from './middleware/requestId.js';
import { apiRouter } from './routes/index.js';
import { docsRouter } from './routes/docs.js';
import { config } from './config/index.js';
import { ErrorCode } from './shared/index.js';
import { registerEventHandlers } from './bootstrap/EventRegistration.js';

registerEventHandlers();

const app = new Hono();

app.use('*', requestId());
app.use('*', corsMiddleware());
app.use('*', csrf({ origin: [config.frontendUrl] }));
app.use('*', securityHeaders());
app.use('*', errorWrapper());
app.use('/api/*', bodyLimit({ maxSize: 1024 * 1024, onError: (c) => c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Request body too large' } }, 413) }));
app.use('/api/v1/upload/*', bodyLimit({ maxSize: 10 * 1024 * 1024, onError: (c) => c.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'File too large' } }, 413) }));
app.use('/api/*', rateLimiter('global'));
app.use('/api/v1/admin/*', rateLimiter('admin'));

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

export default app;
