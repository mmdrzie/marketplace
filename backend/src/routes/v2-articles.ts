import { Hono } from 'hono';
import { articleController } from '../container.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = new Hono();

router.get('/', (c) => articleController.list(c));
router.get('/:slug', (c) => articleController.get(c));
router.post('/:id/views', rateLimiter('article:view'), (c) => articleController.incrementViews(c));

export { router as articleV2Router };
