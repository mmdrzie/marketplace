import type { Context } from 'hono';
import { ProvinceRepositoryImpl } from '../../infrastructure/province/ProvinceRepository.impl.js';

export class ProvinceController {
  constructor(private readonly repo: ProvinceRepositoryImpl) {}

  async list(c: Context): Promise<Response> {
    const provinces = await this.repo.findAll();
    return c.json({ data: provinces.map(p => p.snapshot()) });
  }

  async get(c: Context): Promise<Response> {
    const province = await this.repo.findById(Number(c.req.param('id')));
    if (!province) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: province.snapshot() });
  }

  async getCities(c: Context): Promise<Response> {
    const cities = await this.repo.findCities(Number(c.req.param('id')));
    return c.json({ data: cities.map(city => city.snapshot()) });
  }
}
