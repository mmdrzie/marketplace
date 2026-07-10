import { Hono } from 'hono';
import { getDb } from '../config/database.js';
import { AppError } from '../errors.js';

const router = new Hono();

router.get('/', async (c) => {
  const db = await getDb();
  const category = c.req.query('category');
  const search = c.req.query('q');
  let sql = 'SELECT * FROM parts WHERE 1=1';
  const params: unknown[] = [];
  if (category) { sql += ' AND category_slug = $1'; params.push(category); }
  if (search) { sql += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1} OR part_number ILIKE $${params.length + 1})`; params.push(`%${search}%`); }
  sql += ' ORDER BY name ASC';
  const { rows } = await db.query(sql, params);
  return c.json({ success: true, data: rows });
});

router.get('/:id', async (c) => {
  const db = await getDb();
  const { rows } = await db.query('SELECT * FROM parts WHERE id = $1', [c.req.param('id')]);
  if (!rows[0]) throw AppError.notFound('Part not found');
  return c.json({ success: true, data: rows[0] });
});

export { router as partsRouter };
