import { Hono } from 'hono';
import { attributeController } from '../container.js';

const router = new Hono();

router.get('/category/:categoryId', (c) => attributeController.listByCategory(c));
router.get('/:id', (c) => attributeController.get(c));

export { router as attributeV2Router };
