import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getDb } from '../config/database';
import { auth } from '../middleware/auth';
import { AppError } from '../errors';

const router = new Hono();

const createTenderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  category: z.string().optional(),
  province_id: z.number().int().positive().optional(),
  city_id: z.number().int().positive().optional(),
  budget: z.number().int().min(0).optional(),
  deadline: z.string().datetime(),
});

const bidSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string().max(2000).optional(),
});

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').substring(0, 100) || 'tender';
}

// GET /tenders — open tenders
router.get('/', async (c) => {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT t.*, u.name as user_name
     FROM tenders t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.status = 'open' AND t.deadline > NOW()
     ORDER BY t.created_at DESC`,
  );
  return c.json({ success: true, data: rows });
});

// GET /tenders/:slug — tender detail
router.get('/:slug', async (c) => {
  const db = await getDb();
  const { rows } = await db.query(
    `SELECT t.*, u.name as user_name
     FROM tenders t
     LEFT JOIN users u ON u.id = t.user_id
     WHERE t.slug = $1`,
    [c.req.param('slug')],
  );
  const tender = rows[0];
  if (!tender) throw AppError.notFound('Tender not found');

  await db.query('UPDATE tenders SET views = views + 1 WHERE id = $1', [(tender as { id: number }).id]);

  return c.json({ success: true, data: tender });
});

// POST /tenders — create tender (auth)
router.post('/', auth(), zValidator('json', createTenderSchema), async (c) => {
  const body = c.req.valid('json');
  const slug = generateSlug(body.title);

  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO tenders (user_id, title, slug, description, category, province_id, city_id, budget, deadline)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [c.get('user').id, body.title, slug, body.description ?? '', body.category ?? null, body.province_id ?? null, body.city_id ?? null, body.budget ?? 0, body.deadline],
  );
  return c.json({ success: true, data: rows[0] }, 201);
});

// POST /tenders/:id/bid — place bid (auth)
router.post('/:id/bid', auth(), zValidator('json', bidSchema), async (c) => {
  const tenderId = parseInt(c.req.param('id'), 10);

  const db = await getDb();
  const { rows: tenders } = await db.query('SELECT * FROM tenders WHERE id = $1', [tenderId]);
  const tender = tenders[0] as { status: string; user_id: string } | undefined;
  if (!tender) throw AppError.notFound('Tender not found');
  if (tender.status !== 'open') throw AppError.validation('Tender is not open for bids');
  if (tender.user_id === c.get('user').id) throw AppError.validation('You cannot bid on your own tender');

  const body = c.req.valid('json');
  const { rows } = await db.query(
    `INSERT INTO tender_bids (tender_id, user_id, amount, description) VALUES ($1, $2, $3, $4) RETURNING *`,
    [tenderId, c.get('user').id, body.amount, body.description ?? ''],
  );
  return c.json({ success: true, data: rows[0] }, 201);
});

export { router as tenderRouter };
