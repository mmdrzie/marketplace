import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { userController, notificationPrefsController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.get('/', auth(), (c) => userController.getProfile(c));
router.put('/', auth(), (c) => userController.updateProfile(c));
router.post('/avatar', auth(), zValidator('json', z.object({
  object_key: z.string().min(1).max(500),
})), (c) => userController.updateAvatar(c));

router.get('/notification-preferences', auth(), (c) => notificationPrefsController.get(c));
router.put('/notification-preferences', auth(), (c) => notificationPrefsController.update(c));

export { router as meV2Router };
