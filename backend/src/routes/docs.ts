import { Hono } from 'hono';
import { swaggerUI } from '@hono/swagger-ui';
import { openapiSpec } from '../openapi/spec.js';
import { eventApiSpec } from '../openapi/events.js';

const router = new Hono();

// OpenAPI REST spec
router.get('/docs', swaggerUI({ url: '/api/v1/docs/openapi' }));
router.get('/docs/openapi', (c) => c.json(openapiSpec));

// AsyncAPI event spec (machine-readable; use AsyncAPI Studio to render)
router.get('/docs/events', (c) => c.json(eventApiSpec));

export { router as docsRouter };
