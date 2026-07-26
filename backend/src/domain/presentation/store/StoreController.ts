import type { Context } from 'hono';
import { storeService } from '../../services/store.js';
import { dealerService } from '../../services/dealer.js';

export class StoreController {
  // --- Inventory ---

  async addInventory(c: Context): Promise<Response> {
    const user = c.get('user');
    const { partId, price, stockCount, notes } = await c.req.json();
    const item = await storeService.addInventory({ user, partId, price, stockCount, notes });
    return c.json({ success: true, data: item }, 201);
  }

  async updateInventory(c: Context): Promise<Response> {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    const { price, stockCount, status, notes } = await c.req.json();
    const item = await storeService.updateInventory({ user, id, price, stockCount, status, notes });
    return c.json({ success: true, data: item });
  }

  async deleteInventory(c: Context): Promise<Response> {
    const user = c.get('user');
    const id = Number(c.req.param('id'));
    await storeService.deleteInventory(user, id);
    return c.json({ success: true });
  }

  async listInventory(c: Context): Promise<Response> {
    const user = c.get('user');
    const status = c.req.query('status');
    const items = await storeService.listInventory(user, status);
    return c.json({ success: true, data: items });
  }

  async inventoryStats(c: Context): Promise<Response> {
    const user = c.get('user');
    const stats = await storeService.getInventoryStats(user);
    return c.json({ success: true, data: stats });
  }

  // --- Delegated to dealerService ---

  async stats(c: Context): Promise<Response> {
    const user = c.get('user');
    const data = await dealerService.stats(user.id);
    return c.json({ success: true, data });
  }

  async subscription(c: Context): Promise<Response> {
    const user = c.get('user');
    const sub = await dealerService.subscription(user.id);
    return c.json({ success: true, data: sub });
  }
}
