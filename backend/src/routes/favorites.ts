import { Hono } from 'hono';
import { favoriteRepo } from '../repositories/favorite.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

// GET /favorites — user's favorited listings
router.get('/', auth(), async (c) => {
  const listings = await favoriteRepo.findByUser(c.get('user').id);
  return c.json({ success: true, data: listings });
});

export { router as favoriteRouter };
