import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authService } from '../domain/services/auth.js';
import { auth } from '../middleware/auth.js';
import { updateProfileSchema } from '../validation/auth.js';
import { AppError } from '../errors.js';

const router = new Hono();

router.get('/', auth(), async (c) => {
  const user = c.get('user');
  const profile = await authService.getMe(user.id);
  return c.json({ success: true, data: profile });
});

router.put('/', auth(), zValidator('json', updateProfileSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  const profile = await authService.updateProfile(user.id, data);
  return c.json({ success: true, data: profile });
});

router.post('/avatar', auth(), zValidator('json', z.object({
  object_key: z.string(),
})), async (c) => {
  const user = c.get('user');
  const { object_key } = c.req.valid('json');
  const profile = await authService.updateProfile(user.id, { avatar: object_key });
  return c.json({ success: true, data: profile });
});

router.get('/notification-preferences', auth(), async (c) => {
  return c.json({ success: true, data: {} });
});

router.put('/notification-preferences', auth(), zValidator('json', z.object({
  preferences: z.record(z.boolean()),
})), async (c) => {
  return c.json({ success: true, data: {} });
});

export { router as meRouter };