import type { Context } from 'hono';
import { CategoryRepositoryImpl } from '../../infrastructure/category/CategoryRepository.impl.js';

export class CategoryController {
  constructor(private readonly repo: CategoryRepositoryImpl) {}

  async list(c: Context): Promise<Response> {
    const categories = await this.repo.findAll();
    return c.json({ data: categories.map(cat => cat.snapshot()) });
  }

  async get(c: Context): Promise<Response> {
    const category = await this.repo.findById(Number(c.req.param('id')));
    if (!category) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: category.snapshot() });
  }

  async getChildren(c: Context): Promise<Response> {
    const children = await this.repo.findChildren(Number(c.req.param('id')));
    return c.json({ data: children.map(cat => cat.snapshot()) });
  }
}
