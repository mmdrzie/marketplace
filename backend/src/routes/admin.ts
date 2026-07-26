import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { adminController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.use('*', auth('admin'));

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'dealer', 'agency', 'store', 'admin']).optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['user', 'dealer', 'agency', 'store', 'admin']).optional(),
  status: z.enum(['active', 'banned', 'suspended']).optional(),
  phone: z.string().optional(),
});

router.get('/users', (c) => adminController.listUsers(c));
router.post('/users', zValidator('json', createUserSchema), (c) => adminController.createUser(c));
router.put('/users/:id', zValidator('json', updateUserSchema), (c) => adminController.updateUser(c));
router.put('/users/:id/role', zValidator('json', z.object({ role: z.enum(['user', 'dealer', 'agency', 'store', 'admin']) })), (c) => adminController.updateUserRole(c));

export { router as adminRouter };
