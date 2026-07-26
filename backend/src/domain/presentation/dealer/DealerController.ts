import type { Context } from 'hono';
import { dealerService } from '../../services/dealer.js';

export class DealerController {
  async upgrade(c: Context): Promise<Response> {
    const user = c.get('user');
    const { role, business_name } = await c.req.json();
    const profile = await dealerService.upgrade({ role, business_name, user });
    return c.json({ success: true, data: profile }, 201);
  }

  async getPublicProfile(c: Context): Promise<Response> {
    const { userId } = c.req.param();
    const profile = await dealerService.getPublicProfile(userId);
    return c.json({ success: true, data: profile });
  }

  async addReview(c: Context): Promise<Response> {
    const user = c.get('user');
    const { dealer_id, rating, comment } = await c.req.json();
    const review = await dealerService.addReview({ dealer_id, rating, comment, user });
    return c.json({ success: true, data: review }, 201);
  }

  async stats(c: Context): Promise<Response> {
    const user = c.get('user');
    const stats = await dealerService.getStats(user);
    return c.json({ success: true, data: stats });
  }

  async subscription(c: Context): Promise<Response> {
    const user = c.get('user');
    const sub = await dealerService.getSubscription(user);
    return c.json({ success: true, data: sub });
  }
}
