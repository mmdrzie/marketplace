import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { userController } from '../container.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validation/auth.js';

const router = new Hono();

router.post('/register', rateLimiter('register'), zValidator('json', registerSchema), (c) => userController.register(c));
router.post('/login', rateLimiter('login'), zValidator('json', loginSchema), (c) => userController.login(c));
router.post('/refresh', (c) => userController.refresh(c));
router.post('/logout', (c) => userController.logout(c));
router.get('/me', auth(), (c) => userController.getProfile(c));
router.put('/me', auth(), zValidator('json', updateProfileSchema), (c) => userController.updateProfile(c));
router.post('/forgot-password', rateLimiter('forgot:password'), zValidator('json', forgotPasswordSchema), (c) => userController.forgotPassword(c));
router.post('/reset-password', rateLimiter('forgot:password'), zValidator('json', resetPasswordSchema), (c) => userController.resetPassword(c));

export { router as authV2Router };
