import { Hono } from 'hono';
import { workshopController } from '../domain/presentation/workshop/WorkshopController.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

// GET /v2/workshops — public list (approved only)
router.get('/', (c) => workshopController.list(c));

// GET /v2/workshops/cities — public distinct city list
router.get('/cities', (c) => workshopController.cities(c));

// GET /v2/workshops/my — owner's own profile
router.get('/my', auth(), (c) => workshopController.my(c));

// POST /v2/workshops — owner registers / re-submits profile
router.post('/', auth(), (c) => workshopController.register(c));

// PUT /v2/workshops/my — owner edits profile
router.put('/my', auth(), (c) => workshopController.update(c));

// GET /v2/workshops/:slug — public profile
router.get('/:slug', (c) => workshopController.getBySlug(c));

export { router as workshopV2Router };
