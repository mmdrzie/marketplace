import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { userController, googleAuthController } from '../container.js';
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
  googleFinalizeSchema,
  googleVerifySchema,
  googleResendSchema,
  googleLinkSchema,
  sendVerifyCodeSchema,
  verifyCodeSchema,
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

/* ---- Email verification fallback (blocked login) ---- */

router.post('/send-verify-code', rateLimiter('otp:send'), zValidator('json', sendVerifyCodeSchema), (c) => userController.sendVerifyCode(c));

router.post('/verify-code', rateLimiter('otp:verify'), zValidator('json', verifyCodeSchema), (c) => userController.verifyCode(c));

/* ---- Google OAuth ---- */

router.get('/google/status', (c) => googleAuthController.status(c));
router.get('/google/authorize', (c) => googleAuthController.authorize(c));
router.get('/google/callback', (c) => googleAuthController.callback(c));
router.post('/google/finalize', zValidator('json', googleFinalizeSchema), (c) => googleAuthController.finalize(c));
router.post('/google/verify', rateLimiter('google:verify'), zValidator('json', googleVerifySchema), (c) => googleAuthController.verify(c));
router.post('/google/resend', rateLimiter('google:resend'), zValidator('json', googleResendSchema), (c) => googleAuthController.resend(c));
router.post('/google/link', rateLimiter('google:link'), zValidator('json', googleLinkSchema), (c) => googleAuthController.link(c));

export { router as authRouter };
