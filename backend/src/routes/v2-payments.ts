import { Hono } from 'hono';
import { paymentController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.get('/:id', auth(), (c) => paymentController.get(c));
router.get('/', auth(), (c) => paymentController.listByUser(c));

export { router as paymentV2Router };
