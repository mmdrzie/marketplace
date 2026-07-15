import { Hono } from 'hono';
import { provinceRepo } from '../repositories/province.js';
import { AppError } from '../errors.js';

const router = new Hono();

// Public: get all provinces with cities
router.get('/', async (c) => {
  const provinces = await provinceRepo.findAll();
  const result = await Promise.all(
    provinces.map(async (p) => {
      const cities = await provinceRepo.findCities(p.id);
      return { ...p, cities };
    }),
  );
  return c.json({ success: true, data: result });
});

// Public: get cities by province slug
router.get('/:slug/cities', async (c) => {
  const slug = c.req.param('slug');
  const province = await provinceRepo.findBySlug(slug);
  if (!province) throw AppError.notFound('Province not found');
  const cities = await provinceRepo.findCities(province.id);
  return c.json({ success: true, data: cities });
});

export { router as provinceRouter };
