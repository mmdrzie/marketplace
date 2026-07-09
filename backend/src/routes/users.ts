import { Hono } from 'hono';
import { userRepo } from '../repositories/user.js';
import { AppError } from '../errors.js';

const router = new Hono();

// GET /users/:id/profile — public user profile
router.get('/:id/profile', async (c) => {
  const user = await userRepo.findById(c.req.param('id'));
  if (!user) throw AppError.notFound('User not found');

  return c.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      city: user.city,
      created_at: user.created_at,
    },
  });
});

export { router as userRouter };
