import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { emailVerificationService } from '../domain/services/emailVerification.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = new Hono();

const sendVerifySchema = z.object({
  email: z.string().email(),
});

router.post('/send-verify', auth(), rateLimiter('email:verify'), zValidator('json', sendVerifySchema), async (c) => {
  const user = c.get('user');
  const { email } = c.req.valid('json');

  await emailVerificationService.sendVerification(user.id, email);

  return c.json({ success: true, data: null });
});

const verifySchema = z.object({
  token: z.string(),
});

router.post('/verify', zValidator('json', verifySchema), async (c) => {
  const { token } = c.req.valid('json');
  await emailVerificationService.verify(token);
  return c.json({ success: true, data: null });
});

router.get('/verify/:token', async (c) => {
  const token = c.req.param('token');
  await emailVerificationService.verify(token);
  return c.json({ success: true, data: null });
});

export { router as emailRouter };
