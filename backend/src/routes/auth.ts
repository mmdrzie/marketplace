import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { userController, googleAuthController } from '../container.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  registerWithOtpSchema,
  businessProfileSchema,
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
  validationErrorHook,
} from '../validation/auth.js';

const router = new Hono();

/** zValidator('json', schema, validationErrorHook) — 422 + consistent error shape. */
const zv = <T extends z.ZodTypeAny>(schema: T) => zValidator('json', schema, validationErrorHook);

router.post('/register', rateLimiter('register'), zv(registerSchema), (c) => userController.register(c));
router.post('/register-with-otp', rateLimiter('register'), zv(registerWithOtpSchema), (c) => userController.registerWithOtp(c));
router.post('/send-register-otp', rateLimiter('register'), zv(sendRegisterOtpSchema), (c) => userController.sendRegisterOtp(c));

/* ---- Business profile (Google signups, retry after 'incomplete') ---- */

router.post('/business-profile', auth(), rateLimiter('businessProfile'), zv(businessProfileSchema), (c) => userController.businessProfile(c));

router.post('/login', rateLimiter('login'), zv(loginSchema), (c) => userController.login(c));

router.post('/refresh', (c) => userController.refresh(c));

router.post('/logout', (c) => userController.logout(c));

router.get('/me', auth(), (c) => userController.getProfile(c));

router.put('/me', auth(), zv(updateProfileSchema), (c) => userController.updateProfile(c));

router.post('/forgot', rateLimiter('forgot:password'), zv(forgotPasswordSchema), (c) => userController.forgotPassword(c));

router.post('/reset', rateLimiter('forgot:password'), zv(resetPasswordSchema), (c) => userController.resetPassword(c));

/* ---- Email verification fallback (blocked login) ---- */

router.post('/send-verify-code', rateLimiter('otp:send'), zv(sendVerifyCodeSchema), (c) => userController.sendVerifyCode(c));

router.post('/verify-code', rateLimiter('otp:verify'), zv(verifyCodeSchema), (c) => userController.verifyCode(c));

/* ---- Google OAuth ---- */

router.get('/google/status', (c) => googleAuthController.status(c));
router.get('/google/authorize', (c) => googleAuthController.authorize(c));
router.get('/google/callback', (c) => googleAuthController.callback(c));
router.post('/google/finalize', zv(googleFinalizeSchema), (c) => googleAuthController.finalize(c));
router.post('/google/verify', rateLimiter('google:verify'), zv(googleVerifySchema), (c) => googleAuthController.verify(c));
router.post('/google/resend', rateLimiter('google:resend'), zv(googleResendSchema), (c) => googleAuthController.resend(c));
router.post('/google/link', rateLimiter('google:link'), zv(googleLinkSchema), (c) => googleAuthController.link(c));

export { router as authRouter };
