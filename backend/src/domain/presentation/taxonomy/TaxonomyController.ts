import type { Context } from 'hono';
import { TaxonomyRepository } from '../../entities/taxonomy/Taxonomy.repository.js';

export class TaxonomyController {
  constructor(private readonly repo: TaxonomyRepository) {}

  async getNode(c: Context): Promise<Response> {
    const node = await this.repo.findBySlug(c.req.param('slug'), c.req.param('type'));
    if (!node) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: node.snapshot() });
  }

  async getTree(c: Context): Promise<Response> {
    const tree = await this.repo.findTree(c.req.param('type') || 'category');
    return c.json({ data: tree.map(n => n.snapshot()) });
  }

  async getChildren(c: Context): Promise<Response> {
    const parentId = Number(c.req.param('parentId'));
    const children = await this.repo.findChildren(parentId);
    return c.json({ data: children.map(n => n.snapshot()) });
  }
}
