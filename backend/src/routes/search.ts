import { Hono } from 'hono';
import { listingService } from '../domain/services/listing';
import { AppError } from '../errors';

const router = new Hono();

router.get('/', async (c) => {
  const q = c.req.query('q');
  if (!q || q.trim().length === 0) {
    throw AppError.validation('Search query is required');
  }

  const result = await listingService.search(q, {
    category: c.req.query('category'),
    province: c.req.query('province'),
    min_price: c.req.query('min_price') ? parseInt(c.req.query('min_price')!, 10) : undefined,
    max_price: c.req.query('max_price') ? parseInt(c.req.query('max_price')!, 10) : undefined,
  });

  return c.json({
    success: true,
    data: result.data,
    meta: { total: result.total },
  });
});

export { router as searchRouter };
