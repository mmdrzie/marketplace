import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { paymentController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

const depositSchema = z.object({
  amount: z.number().int().positive(),
});

const featuredSchema = z.object({
  listing_id: z.number().int().positive(),
});

router.post('/featured', auth(), zValidator('json', featuredSchema), async (c) => {
  return paymentController.createFeatured(c);
});

router.post('/dealer-subscription', auth(), async (c) => {
  return paymentController.createSubscription(c);
});

router.post('/deposit', auth(), zValidator('json', depositSchema), async (c) => {
  return paymentController.createDeposit(c);
});

export { router as paymentRouter };
