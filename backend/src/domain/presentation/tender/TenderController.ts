import type { Context } from 'hono';
import { TenderRepository } from '../../entities/tender/Tender.repository.js';

export class TenderController {
  constructor(private readonly repo: TenderRepository) {}

  async list(c: Context): Promise<Response> {
    const tenders = await this.repo.findAll({ status: 'active' });
    return c.json({ data: tenders.map(t => t.snapshot()) });
  }

  async get(c: Context): Promise<Response> {
    const tender = await this.repo.findById(Number(c.req.param('id')));
    if (!tender) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: tender.snapshot() });
  }
}
