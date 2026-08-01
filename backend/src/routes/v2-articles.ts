import { Hono } from 'hono';
import { contentController } from '../container.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = new Hono();

router.get('/', (c) => contentController.list(c, 'news'));
router.get('/:slug', (c) => contentController.get(c));
router.post('/:id/views', rateLimiter('article:view'), (c) => contentController.incrementViews(c));

export { router as articleV2Router };
