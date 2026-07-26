import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { userController } from '../container.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  registerWithOtpSchema,
  sendRegisterOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validation/auth.js';

const router = new Hono();

router.post('/register', rateLimiter('register'), zValidator('json', registerSchema), (c) => userController.register(c));
router.post('/register-with-otp', rateLimiter('register'), zValidator('json', registerWithOtpSchema), (c) => userController.registerWithOtp(c));
router.post('/send-register-otp', rateLimiter('register'), zValidator('json', sendRegisterOtpSchema), (c) => userController.sendRegisterOtp(c));

router.post('/login', rateLimiter('login'), zValidator('json', loginSchema), (c) => userController.login(c));

router.post('/refresh', (c) => userController.refresh(c));

router.post('/logout', (c) => userController.logout(c));

router.get('/me', auth(), (c) => userController.getProfile(c));

router.put('/me', auth(), zValidator('json', updateProfileSchema), (c) => userController.updateProfile(c));

router.post('/forgot', rateLimiter('forgot:password'), zValidator('json', forgotPasswordSchema), (c) => userController.forgotPassword(c));

router.post('/reset', rateLimiter('forgot:password'), zValidator('json', resetPasswordSchema), (c) => userController.resetPassword(c));

export { router as authRouter };
