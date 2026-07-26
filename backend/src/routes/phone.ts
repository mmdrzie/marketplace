import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { phoneVerificationController } from '../container.js';
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
  return phoneVerificationController.sendOtp(c);
});

router.post('/verify-otp', auth(), rateLimiter('otp:verify'), zValidator('json', verifyOtpSchema), async (c) => {
  return phoneVerificationController.verifyOtp(c);
});

router.get('/status', auth(), async (c) => {
  return phoneVerificationController.status(c);
});

export { router as phoneRouter };
