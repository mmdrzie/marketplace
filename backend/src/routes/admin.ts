import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { AppError } from '../errors.js';
import { getDb } from '../config/database.js';
import bcrypt from 'bcryptjs';

const router = new Hono();

// All admin routes require auth + admin role
router.use('*', auth(), adminAuth());

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'dealer', 'agency', 'admin']).optional(),
  status: z.string().optional(),
});

const roleSchema = z.object({
  role: z.enum(['user', 'dealer', 'agency', 'admin']),
});

const statusSchema = z.object({
  status: z.string().min(1),
});

const settingsSchema = z.object({
  maintenance_mode: z.boolean().optional(),
  max_listings_per_user: z.number().int().positive().optional(),
  default_listings_limit: z.number().int().positive().optional(),
  featured_price: z.number().int().positive().optional(),
  subscription_price: z.number().int().positive().optional(),
});

const reportStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'dismissed']),
});

// GET /admin/users — all users with search/pagination
router.get('/users', async (c) => {
  const q = c.req.query('q');
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = parseInt(c.req.query('per_page') || '20', 10);
  const offset = (page - 1) * perPage;

  const db = await getDb();

  if (q) {
    const searchTerm = `%${q}%`;
    const countRes = await db.query(
      'SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL AND (name ILIKE $1 OR email ILIKE $1)',
      [searchTerm],
    );
    const total = parseInt((countRes.rows[0] as { total: string }).total, 10);

    const { rows } = await db.query(
      'SELECT id, email, name, phone, role, status, avatar, city, email_verified_at, phone_verified_at, created_at FROM users WHERE deleted_at IS NULL AND (name ILIKE $1 OR email ILIKE $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [searchTerm, perPage, offset],
    );
    return c.json({ success: true, data: rows, meta: { current_page: page, per_page: perPage, total, last_page: Math.ceil(total / perPage) } });
  }

  const countRes = await db.query('SELECT COUNT(*) as total FROM users WHERE deleted_at IS NULL');
  const total = parseInt((countRes.rows[0] as { total: string }).total, 10);

  const { rows } = await db.query(
    'SELECT id, email, name, phone, role, status, avatar, city, email_verified_at, phone_verified_at, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [perPage, offset],
  );
  return c.json({ success: true, data: rows, meta: { current_page: page, per_page: perPage, total, last_page: Math.ceil(total / perPage) } });
});

// POST /admin/users — create user (admin)
router.post('/users', zValidator('json', createUserSchema), async (c) => {
  const body = c.req.valid('json');
  const passwordHash = await bcrypt.hash(body.password, 12);

  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO users (email, password_hash, name, role, status)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, phone, role, status, avatar, city, email_verified_at, phone_verified_at, created_at`,
    [body.email, passwordHash, body.name, body.role ?? 'user', body.status ?? 'active'],
  );
  return c.json({ success: true, data: rows[0] }, 201);
});

// PUT /admin/users/:id/role — change role
router.put('/users/:id/role', zValidator('json', roleSchema), async (c) => {
  const { role } = c.req.valid('json');
  const db = await getDb();
  const { rowCount } = await db.query(
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL',
    [role, c.req.param('id')],
  );
  if (rowCount === 0) throw AppError.notFound('User not found');
  return c.json({ success: true, data: null });
});

// PUT /admin/users/:id/status — activate/deactivate
router.put('/users/:id/status', zValidator('json', statusSchema), async (c) => {
  const { status } = c.req.valid('json');
  const db = await getDb();
  const { rowCount } = await db.query(
    'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL',
    [status, c.req.param('id')],
  );
  if (rowCount === 0) throw AppError.notFound('User not found');
  return c.json({ success: true, data: null });
});

// DELETE /admin/users/:id — soft-delete
router.delete('/users/:id', async (c) => {
  const db = await getDb();
  const { rowCount } = await db.query(
    'UPDATE users SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
    [c.req.param('id')],
  );
  if (rowCount === 0) throw AppError.notFound('User not found');
  return c.json({ success: true, data: null });
});

// GET /admin/settings — app settings (from config, stored in memory for MVP)
router.get('/settings', async (c) => {
  const db = await getDb();
  const { rows } = await db.query('SELECT * FROM app_settings LIMIT 1');
  return c.json({ success: true, data: (rows[0] as Record<string, unknown>) || {} });
});

// PUT /admin/settings — update settings
router.put('/settings', zValidator('json', settingsSchema), async (c) => {
  const body = c.req.valid('json');
  const db = await getDb();
  const existing = await db.query('SELECT * FROM app_settings LIMIT 1');

  if ((existing.rows[0] as Record<string, unknown> | undefined)) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length > 0) {
      values.push((existing.rows[0] as { id: number }).id);
      await db.query(`UPDATE app_settings SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    }
  } else {
    await db.query(
      `INSERT INTO app_settings (${Object.keys(body).join(', ')})
       VALUES (${Object.keys(body).map((_, i) => `$${i + 1}`).join(', ')})`,
      Object.values(body),
    );
  }

  return c.json({ success: true, data: body });
});

// GET /admin/reports — reported listings
router.get('/reports', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10);
  const perPage = parseInt(c.req.query('per_page') || '20', 10);
  const offset = (page - 1) * perPage;

  const db = await getDb();
  const countRes = await db.query('SELECT COUNT(*) as total FROM reports');
  const total = parseInt((countRes.rows[0] as { total: string }).total, 10);

  const { rows } = await db.query(
    `SELECT r.*, u.name as reporter_name, l.title as listing_title, l.slug as listing_slug
     FROM reports r
     JOIN users u ON u.id = r.user_id
     JOIN listings l ON l.id = r.listing_id
     ORDER BY r.created_at DESC LIMIT $1 OFFSET $2`,
    [perPage, offset],
  );
  return c.json({ success: true, data: rows, meta: { current_page: page, per_page: perPage, total, last_page: Math.ceil(total / perPage) } });
});

// PUT /admin/reports/:id — update report status
router.put('/reports/:id', zValidator('json', reportStatusSchema), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { status } = c.req.valid('json');
  const db = await getDb();
  await db.query('UPDATE reports SET status = $1 WHERE id = $2', [status, id]);
  return c.json({ success: true, data: null });
});

export { router as adminRouter };
