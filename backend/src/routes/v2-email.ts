import { Hono } from 'hono';
import { emailVerificationController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.post('/send', auth(), (c) => emailVerificationController.send(c));
router.get('/verify/:token', (c) => emailVerificationController.verify(c));

export { router as emailV2Router };
