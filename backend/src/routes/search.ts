import { Hono } from 'hono';
import { listingRepo } from '../repositories/listing.js';
import { cache } from '../services/cache/index.js';
import { AppError } from '../errors.js';

const router = new Hono();

router.get('/', async (c) => {
  const q = c.req.query('q');
  if (!q || q.trim().length === 0) {
    throw AppError.validation('Search query is required');
  }

  const minPrice = c.req.query('min_price') ?? c.req.query('price_min');
  const maxPrice = c.req.query('max_price') ?? c.req.query('price_max');

  const filters = {
    category: c.req.query('category'),
    province: c.req.query('province'),
    city_id: c.req.query('city_id'),
    brand: c.req.query('brand'),
    model: c.req.query('model'),
    year_from: c.req.query('year_from'),
    year_to: c.req.query('year_to'),
    seller_type: c.req.query('seller_type'),
    mileage_from: c.req.query('mileage_from'),
    mileage_to: c.req.query('mileage_to'),
    mileage_zero: c.req.query('mileage_zero'),
    gearbox: c.req.query('gearbox'),
    has_photo: c.req.query('has_photo'),
    has_price: c.req.query('has_price'),
    color: c.req.query('color'),
    fuel_type: c.req.query('fuel_type'),
    special_case: c.req.query('special_case'),
    body_condition: c.req.query('body_condition'),
    cylinders: c.req.query('cylinders'),
    drivetrain: c.req.query('drivetrain'),
    min_price: minPrice ? parseInt(minPrice, 10) : undefined,
    max_price: maxPrice ? parseInt(maxPrice, 10) : undefined,
    sort: c.req.query('sort'),
    page: c.req.query('page') ? parseInt(c.req.query('page')!, 10) : undefined,
    perPage: c.req.query('per_page') ? parseInt(c.req.query('per_page')!, 10) : undefined,
  };

  const cacheKey = `search:${q.slice(0, 200)}:${JSON.stringify(filters)}`;
  const cached = cache.get<{ data: unknown[]; total: number; page: number; lastPage: number }>(cacheKey);
  if (cached) {
    return c.json({
      success: true,
      data: cached.data,
      meta: { total: cached.total, current_page: cached.page, last_page: cached.lastPage, per_page: 24 },
    });
  }

  const result = await listingRepo.search(q, filters as Parameters<typeof listingRepo.search>[1]);
  cache.set(cacheKey, result, 30000);

  return c.json({
    success: true,
    data: result.data,
    meta: { total: result.total, current_page: result.page, last_page: result.lastPage, per_page: 24 },
  });
});

export { router as searchRouter };
