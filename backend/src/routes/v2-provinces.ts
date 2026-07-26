import { Hono } from 'hono';
import { provinceController } from '../container.js';

const router = new Hono();

router.get('/', (c) => provinceController.list(c));
router.get('/:id', (c) => provinceController.get(c));
router.get('/:id/cities', (c) => provinceController.getCities(c));

export { router as provinceV2Router };
