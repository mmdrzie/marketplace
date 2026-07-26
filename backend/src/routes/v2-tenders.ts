import { Hono } from 'hono';
import { tenderController } from '../container.js';

const router = new Hono();

router.get('/', (c) => tenderController.list(c));
router.get('/:id', (c) => tenderController.get(c));

export { router as tenderV2Router };
