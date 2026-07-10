import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../config/database.js';
import { auth } from '../middleware/auth.js';
import { AppError } from '../errors.js';

const router = new Hono();

const createSchema = z.object({
  listing_id: z.number().int().positive(),
  seller_id: z.string().uuid(),
  amount: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
});

const updateSchema = z.object({
  status: z.enum(['pending_payment', 'payment_held', 'under_review', 'released', 'cancelled']),
  notes: z.string().max(2000).optional(),
});

router.post('/', auth(), zValidator('json', createSchema), async (c) => {
  const body = c.req.valid('json');
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO escrow_deals (listing_id, buyer_id, seller_id, amount, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [body.listing_id, c.get('user').id, body.seller_id, body.amount, body.notes ?? ''],
  );
  return c.json({ success: true, data: rows[0] }, 201);
});

router.get('/', auth(), async (c) => {
  const db = await getDb();
  const user = c.get('user').id;
  const { rows } = await db.query(
    'SELECT * FROM escrow_deals WHERE buyer_id = $1 OR seller_id = $1 ORDER BY created_at DESC',
    [user],
  );
  return c.json({ success: true, data: rows });
});

router.get('/:id', auth(), async (c) => {
  const db = await getDb();
  const user = c.get('user').id;
  const { rows } = await db.query(
    'SELECT * FROM escrow_deals WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
    [c.req.param('id'), user],
  );
  if (!rows[0]) throw AppError.notFound('Deal not found');
  return c.json({ success: true, data: rows[0] });
});

router.patch('/:id', auth(), zValidator('json', updateSchema), async (c) => {
  const body = c.req.valid('json');
  const db = await getDb();
  const user = c.get('user').id;
  const { rows } = await db.query('SELECT * FROM escrow_deals WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)', [c.req.param('id'), user]);
  if (!rows[0]) throw AppError.notFound('Deal not found');
  const deal = rows[0] as { released_at?: string; notes?: string };
  const releasedAt = body.status === 'released' ? new Date().toISOString() : deal.released_at;
  const { rows: updated } = await db.query(
    'UPDATE escrow_deals SET status = $1, notes = $2, released_at = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
    [body.status, body.notes ?? deal.notes, releasedAt, c.req.param('id')],
  );
  return c.json({ success: true, data: updated[0] });
});

export { router as escrowRouter };
