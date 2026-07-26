import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { emailVerificationController } from '../container.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = new Hono();

const sendVerifySchema = z.object({
  email: z.string().email(),
});

router.post('/send-verify', auth(), rateLimiter('email:verify'), zValidator('json', sendVerifySchema), async (c) => {
  return emailVerificationController.send(c);
});

const verifySchema = z.object({
  token: z.string(),
});

router.post('/verify', zValidator('json', verifySchema), async (c) => {
  return emailVerificationController.verifyFromBody(c);
});

router.get('/verify/:token', async (c) => {
  return emailVerificationController.verify(c);
});

export { router as emailRouter };
