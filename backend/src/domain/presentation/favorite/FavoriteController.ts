import type { Context } from 'hono';
import { FavoriteRepositoryImpl } from '../../infrastructure/favorite/FavoriteRepository.impl.js';

export class FavoriteController {
  constructor(private readonly repo: FavoriteRepositoryImpl) {}

  async list(c: Context): Promise<Response> {
    const user = c.get('user');
    const favorites = await this.repo.findByUser(user.id);
    return c.json({ data: favorites.map(f => f.snapshot()) });
  }

  async toggle(c: Context): Promise<Response> {
    const user = c.get('user');
    const listingId = Number(c.req.param('listingId'));
    const result = await this.repo.toggle(user.id, listingId);
    return c.json({ data: result }, result.favorited ? 201 : 200);
  }
}
