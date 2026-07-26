import type { Context } from 'hono';
import { ArticleRepositoryImpl } from '../../infrastructure/article/ArticleRepository.impl.js';

export class ArticleController {
  constructor(private readonly repo: ArticleRepositoryImpl) {}

  async list(c: Context): Promise<Response> {
    const articles = await this.repo.findAll();
    return c.json({ data: articles.map(a => a.snapshot()) });
  }

  async get(c: Context): Promise<Response> {
    const article = await this.repo.findBySlug(c.req.param('slug'));
    if (!article) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: article.snapshot() });
  }

  async incrementViews(c: Context): Promise<Response> {
    await this.repo.incrementViews(Number(c.req.param('id')));
    return c.json({ success: true });
  }
}
