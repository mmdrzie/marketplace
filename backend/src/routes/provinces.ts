import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { provinceRepo } from '../repositories/province';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import { AppError } from '../errors';
import { createProvinceSchema, updateProvinceSchema, createCitySchema } from '../validation/categories';

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

// Admin: create province
router.post('/', auth(), adminAuth(), zValidator('json', createProvinceSchema), async (c) => {
  const body = c.req.valid('json');
  const province = await provinceRepo.create(body);
  return c.json({ success: true, data: province }, 201);
});

// Admin: update province
router.put('/:id', auth(), adminAuth(), zValidator('json', updateProvinceSchema), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const existing = await provinceRepo.findById(id);
  if (!existing) throw AppError.notFound('Province not found');

  const province = await provinceRepo.update(id, c.req.valid('json'));
  return c.json({ success: true, data: province });
});

// Admin: delete province
router.delete('/:id', auth(), adminAuth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const existing = await provinceRepo.findById(id);
  if (!existing) throw AppError.notFound('Province not found');

  await provinceRepo.delete(id);
  return c.json({ success: true, data: null });
});

// Admin: create city in province
router.post('/:id/cities', auth(), adminAuth(), zValidator('json', createCitySchema), async (c) => {
  const provinceId = parseInt(c.req.param('id'), 10);
  const province = await provinceRepo.findById(provinceId);
  if (!province) throw AppError.notFound('Province not found');

  const { name } = c.req.valid('json');
  const city = await provinceRepo.createCity(provinceId, name);
  return c.json({ success: true, data: city }, 201);
});

// Admin: delete city
router.delete('/cities/:id', auth(), adminAuth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  await provinceRepo.deleteCity(id);
  return c.json({ success: true, data: null });
});

export { router as provinceRouter };
