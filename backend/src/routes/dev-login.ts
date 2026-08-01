import { Hono } from 'hono';
import { signAccessToken, signRefreshToken } from '../services/jwt.js';
import { getDb } from '../config/database.js';

const router = new Hono();

const DEV_EMAILS = [
  'admin@marketplace.com',
  'demo@marketplace.com',
  'dealer@marketplace.com',
  'agency@marketplace.com',
  'store@marketplace.com',
];

router.post('/dev-login', async (c) => {
  if (process.env.NODE_ENV !== 'development') {
    return c.json({ success: false, error: { message: 'Not available in production' } }, 403);
  }

  const { email } = await c.req.json().catch(() => ({}));
  if (!email || !DEV_EMAILS.includes(email)) {
    return c.json({ success: false, error: { message: 'Unknown test user' } }, 400);
  }

  const db = await getDb();
  const { rows } = await db.query(
    'SELECT id, email, name, role, phone, avatar, city, status, email_verified_at, phone_verified_at, created_at FROM users WHERE email = $1 LIMIT 1',
    [email],
  );

  if (rows.length === 0) {
    return c.json({ success: false, error: { message: 'User not found in database. Run migrations first.' } }, 400);
  }

  const user = rows[0] as {
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string | null;
    avatar: string | null;
    city: string | null;
    status: string;
    email_verified_at: string | null;
    phone_verified_at: string | null;
    created_at: string;
  };

  const token = await signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role as 'user' | 'dealer' | 'agency' | 'store' | 'admin',
    phoneVerified: !!user.phone_verified_at,
    emailVerified: !!user.email_verified_at,
  });

  const refreshToken = await signRefreshToken(user.id);

  return c.json({
    success: true,
    data: {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city,
        status: user.status,
        phoneVerified: !!user.phone_verified_at,
        emailVerified: !!user.email_verified_at,
        created_at: user.created_at,
      },
    },
  });
});

export { router as devLoginRouter };
