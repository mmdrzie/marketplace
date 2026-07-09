import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { phoneVerificationService } from '../domain/services/phoneVerification.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = new Hono();

const sendOtpSchema = z.object({
  phone: z.string().min(10).max(15),
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  code: z.string().length(6),
});

router.post('/send-otp', auth(), rateLimiter('otp:send'), zValidator('json', sendOtpSchema), async (c) => {
  const user = c.get('user');
  const { phone } = c.req.valid('json');

  await phoneVerificationService.sendOtp(user.id, phone);

  return c.json({ success: true, data: null });
});

router.post('/verify-otp', auth(), rateLimiter('otp:verify'), zValidator('json', verifyOtpSchema), async (c) => {
  const user = c.get('user');
  const { phone, code } = c.req.valid('json');

  await phoneVerificationService.verifyOtp(user.id, phone, code);

  return c.json({ success: true, data: null });
});

router.get('/status', auth(), async (c) => {
  const user = c.get('user');
  const status = await phoneVerificationService.getStatus(user.id);
  return c.json({ success: true, data: status });
});

export { router as phoneRouter };
