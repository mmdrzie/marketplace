import type { Context } from 'hono';
import { AttributeRepositoryImpl } from '../../infrastructure/attribute/AttributeRepository.impl.js';

export class AttributeController {
  constructor(private readonly repo: AttributeRepositoryImpl) {}

  async listByCategory(c: Context): Promise<Response> {
    const attributes = await this.repo.findByCategory(Number(c.req.param('categoryId')));
    return c.json({ data: attributes.map(a => a.snapshot()) });
  }

  async get(c: Context): Promise<Response> {
    const attribute = await this.repo.findById(Number(c.req.param('id')));
    if (!attribute) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: attribute.snapshot() });
  }
}
