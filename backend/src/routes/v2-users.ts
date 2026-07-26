'use strict';

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { userController } from '../container.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = new Hono();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', rateLimiter('register'), zValidator('json', registerSchema), (c) => userController.register(c));
router.post('/login', rateLimiter('login'), zValidator('json', loginSchema), (c) => userController.login(c));
router.get('/me', auth(), (c) => userController.getProfile(c));

export { router as userV2Router };
