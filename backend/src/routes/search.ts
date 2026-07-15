import { Hono } from 'hono';
import { listingService } from '../domain/services/listing.js';
import { AppError } from '../errors.js';

const router = new Hono();

router.get('/', async (c) => {
  const q = c.req.query('q');
  if (!q || q.trim().length === 0) {
    throw AppError.validation('Search query is required');
  }

  const minPrice = c.req.query('min_price') ?? c.req.query('price_min');
  const maxPrice = c.req.query('max_price') ?? c.req.query('price_max');

  const result = await listingService.search(q, {
    category: c.req.query('category'),
    province: c.req.query('province'),
    city_id: c.req.query('city_id'),
    brand: c.req.query('brand'),
    model: c.req.query('model'),
    year_from: c.req.query('year_from'),
    year_to: c.req.query('year_to'),
    min_price: minPrice ? parseInt(minPrice, 10) : undefined,
    max_price: maxPrice ? parseInt(maxPrice, 10) : undefined,
    sort: c.req.query('sort'),
    page: c.req.query('page') ? parseInt(c.req.query('page')!, 10) : undefined,
    perPage: c.req.query('per_page') ? parseInt(c.req.query('per_page')!, 10) : undefined,
  });

  return c.json({
    success: true,
    data: result.data,
    meta: { total: result.total, current_page: result.page, last_page: result.lastPage, per_page: 24 },
  });
});

export { router as searchRouter };
