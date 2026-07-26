import { Hono } from 'hono';
import { notificationPrefsController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.get('/preferences', auth(), (c) => notificationPrefsController.get(c));
router.put('/preferences', auth(), (c) => notificationPrefsController.update(c));

export { router as notificationV2Router };
