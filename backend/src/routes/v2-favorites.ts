import { Hono } from 'hono';
import { favoriteController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.get('/', auth(), (c) => favoriteController.list(c));
router.post('/listings/:listingId', auth(), (c) => favoriteController.toggle(c));

export { router as favoriteV2Router };
