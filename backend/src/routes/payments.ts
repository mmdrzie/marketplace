import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { paymentService } from '../domain/services/payment.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

const featuredSchema = z.object({
  listing_id: z.number().int().positive(),
});

// POST /payments/featured — create featured listing purchase
router.post('/featured', auth(), zValidator('json', featuredSchema), async (c) => {
  const { listing_id } = c.req.valid('json');
  const result = await paymentService.createFeaturedPayment(listing_id, c.get('user'));
  return c.json({ success: true, data: result }, 201);
});

// POST /payments/dealer-subscription — create subscription purchase
router.post('/dealer-subscription', auth(), async (c) => {
  const result = await paymentService.createSubscriptionPayment(c.get('user'));
  return c.json({ success: true, data: result }, 201);
});

export { router as paymentRouter };
