import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { dealerService } from '../domain/services/dealer.js';
import { auth } from '../middleware/auth.js';

const upgradeSchema = z.object({
  role: z.enum(['dealer', 'agency']),
  business_name: z.string().min(1).max(200),
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

// Account upgrade
const accountRouter = new Hono();
accountRouter.post('/upgrade', auth(), zValidator('json', upgradeSchema), async (c) => {
  const body = c.req.valid('json');
  const profile = await dealerService.upgrade({ ...body, user: c.get('user') });
  return c.json({ success: true, data: profile }, 201);
});

// Dealer dashboard (authenticated, dealer role)
const dealerDashboardRouter = new Hono();
dealerDashboardRouter.get('/stats', auth(), async (c) => {
  const stats = await dealerService.getStats(c.get('user'));
  return c.json({ success: true, data: stats });
});

dealerDashboardRouter.get('/subscription', auth(), async (c) => {
  const sub = await dealerService.getSubscription(c.get('user'));
  return c.json({ success: true, data: sub });
});

// Public dealer profiles
const dealerPublicRouter = new Hono();
dealerPublicRouter.get('/:id/profile', async (c) => {
  const profile = await dealerService.getPublicProfile(c.req.param('id'));
  return c.json({ success: true, data: profile });
});

dealerPublicRouter.post('/:id/reviews', auth(), zValidator('json', reviewSchema), async (c) => {
  const body = c.req.valid('json');
  const review = await dealerService.addReview({
    dealer_id: c.req.param('id'),
    rating: body.rating,
    comment: body.comment,
    user: c.get('user'),
  });
  return c.json({ success: true, data: review }, 201);
});

export { accountRouter, dealerDashboardRouter, dealerPublicRouter };
