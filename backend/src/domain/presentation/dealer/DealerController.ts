import type { Context } from 'hono';
import { dealerService } from '../../services/dealer.js';

export class DealerController {
  async upgrade(c: Context): Promise<Response> {
    const user = c.get('user');
    const { role, business_name, dealer_code, business_address, business_description } = await c.req.json();
    const profile = await dealerService.upgrade({ role, business_name, user, dealer_code, business_address, business_description });
    return c.json({ success: true, data: profile }, 201);
  }

  async myListings(c: Context): Promise<Response> {
    const user = c.get('user');
    const listings = await dealerService.myListings(user.id);
    return c.json({ success: true, data: listings });
  }

  async stats(c: Context): Promise<Response> {
    const user = c.get('user');
    const data = await dealerService.stats(user.id);
    return c.json({ success: true, data });
  }

  async subscription(c: Context): Promise<Response> {
    const user = c.get('user');
    const data = await dealerService.subscription(user.id);
    return c.json({ success: true, data });
  }

  async getPublicProfile(c: Context): Promise<Response> {
    const userId = c.req.param('id');
    if (!userId) return c.json({ error: 'Not found' }, 404);
    const listings = await dealerService.myListings(userId);
    return c.json({ success: true, data: { listings } });
  }

  async addReview(c: Context): Promise<Response> {
    const user = c.get('user');
    const { dealer_id, rating, comment } = await c.req.json();
    const db = (await import('../../../config/database.js')).getDb;
    const d = await db();
    const { rows } = await d.query(
      `INSERT INTO dealer_reviews (dealer_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`,
      [dealer_id, user.id, rating, comment ?? null],
    );
    return c.json({ success: true, data: rows[0] }, 201);
  }
}
