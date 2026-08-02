import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { dealerController } from '../container.js';
import { auth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = new Hono();

const upgradeSchema = z.object({
  role: z.enum(['dealer', 'agency', 'store']),
  business_name: z.string().min(1, 'Business name is required').max(200),
  dealer_code: z.string().optional(),
  business_address: z.string().optional(),
  business_description: z.string().optional(),
});

router.post('/upgrade', auth(), rateLimiter('dealer:upgrade'), zValidator('json', upgradeSchema), (c) => dealerController.upgrade(c));
router.get('/stats', auth('dealer', 'agency', 'store'), (c) => dealerController.stats(c));
// Open to any authenticated user: everyone may view/buy subscription plans.
router.get('/subscription', auth(), (c) => dealerController.subscription(c));

export { router as accountRouter };

const dashboardRouter = new Hono();
dashboardRouter.get('/listings', auth('dealer', 'agency', 'store'), (c) => dealerController.myListings(c));
dashboardRouter.get('/stats', auth('dealer', 'agency', 'store'), (c) => dealerController.stats(c));
export { dashboardRouter as dealerDashboardRouter };

const publicRouter = new Hono();
publicRouter.get('/:id', (c) => dealerController.getPublicProfile(c));
export { publicRouter as dealerPublicRouter };
