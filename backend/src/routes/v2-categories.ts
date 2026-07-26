import { Hono } from 'hono';
import { categoryController } from '../container.js';

const router = new Hono();

router.get('/', (c) => categoryController.list(c));
router.get('/:id', (c) => categoryController.get(c));
router.get('/:id/children', (c) => categoryController.getChildren(c));

export { router as categoryV2Router };
