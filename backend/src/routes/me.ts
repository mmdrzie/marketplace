import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { userController } from '../container.js';
import { auth } from '../middleware/auth.js';
import { updateProfileSchema } from '../validation/auth.js';
import { AppError } from '../errors.js';
import { notificationPreferencesRepo } from '../repositories/notificationPreferences.js';

const router = new Hono();

router.get('/', auth(), (c) => userController.getProfile(c));

router.put('/', auth(), zValidator('json', updateProfileSchema), (c) => userController.updateProfile(c));

router.post('/avatar', auth(), zValidator('json', z.object({
  object_key: z.string().min(1, 'Invalid avatar').max(500),
})), async (c) => {
  const user = c.get('user');
  const { object_key } = c.req.valid('json');
  if (!object_key) throw AppError.badRequest('Invalid avatar');
  return userController.updateAvatar(c);
});

router.get('/notification-preferences', auth(), async (c) => {
  const user = c.get('user');
  const preferences = await notificationPreferencesRepo.get(user.id);
  return c.json({ success: true, data: preferences });
});

router.put('/notification-preferences', auth(), zValidator('json', z.object({
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  marketing_enabled: z.boolean().optional(),
})), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  const preferences = await notificationPreferencesRepo.upsert(user.id, data);
  return c.json({ success: true, data: preferences });
});

export { router as meRouter };
