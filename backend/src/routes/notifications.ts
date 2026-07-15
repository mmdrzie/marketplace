import { Hono } from 'hono';
import { auth } from '../middleware/auth.js';
import { getDb } from '../config/database.js';
import { AppError } from '../errors.js';

const router = new Hono();

router.use('*', auth());

// GET /notifications — user's notifications
router.get('/', async (c) => {
  const userId = c.get('user').id;
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = parseInt(c.req.query('per_page') || '20', 10);
  const offset = (page - 1) * perPage;

  const db = await getDb();
  const countRes = await db.query(
    'SELECT COUNT(*) as total FROM notifications WHERE user_id = $1',
    [userId],
  );
  const total = parseInt((countRes.rows[0] as { total: string }).total, 10);

  const { rows } = await db.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
    [userId, perPage, offset],
  );

  return c.json({
    success: true,
    data: rows,
    meta: { current_page: page, per_page: perPage, total, last_page: Math.ceil(total / perPage) },
  });
});

// PUT /notifications/read-all — mark all as read
router.put('/read-all', async (c) => {
  const db = await getDb();
  await db.query(
    'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false',
    [c.get('user').id],
  );
  return c.json({ success: true, data: null });
});

// PUT /notifications/:id/read — mark single as read
router.put('/:id/read', async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const db = await getDb();
  await db.query(
    'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2',
    [id, c.get('user').id],
  );
  return c.json({ success: true, data: null });
});

// POST /notifications/push-subscribe — save push subscription
router.post('/push-subscribe', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { subscription } = body as { subscription?: string };
  if (!subscription) throw AppError.validation('Subscription is required');

  const db = await getDb();
  await db.query(
    `INSERT INTO push_subscriptions (user_id, subscription, created_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (user_id) DO UPDATE SET subscription = $2, updated_at = NOW()`,
    [c.get('user').id, subscription],
  );

  return c.json({ success: true, data: null });
});

export { router as notificationRouter };
