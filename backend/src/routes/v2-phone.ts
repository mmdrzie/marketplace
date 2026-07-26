import { Hono } from 'hono';
import { phoneVerificationController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.post('/send-otp', auth(), (c) => phoneVerificationController.sendOtp(c));
router.post('/verify-otp', auth(), (c) => phoneVerificationController.verifyOtp(c));
router.get('/status', auth(), (c) => phoneVerificationController.status(c));

export { router as phoneV2Router };
