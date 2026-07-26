import { Hono } from 'hono';
import { dealerController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.post('/upgrade', auth(), (c) => dealerController.upgrade(c));
router.get('/profile/:userId', (c) => dealerController.getPublicProfile(c));
router.post('/reviews', auth(), (c) => dealerController.addReview(c));
router.get('/stats', auth(), (c) => dealerController.stats(c));
router.get('/subscription', auth(), (c) => dealerController.subscription(c));

export { router as dealerV2Router };
