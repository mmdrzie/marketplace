import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { storeController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

const addInventorySchema = z.object({
  partId: z.number().int().positive(),
  price: z.number().int().min(0),
  stockCount: z.number().int().min(0),
  notes: z.string().max(1000).optional(),
});

const updateInventorySchema = z.object({
  price: z.number().int().min(0).optional(),
  stockCount: z.number().int().min(0).optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional(),
  notes: z.string().max(1000).optional(),
});

// Inventory CRUD
router.get('/inventory', auth('store'), (c) => storeController.listInventory(c));
router.post('/inventory', auth('store'), zValidator('json', addInventorySchema), (c) => storeController.addInventory(c));
router.put('/inventory/:id', auth('store'), zValidator('json', updateInventorySchema), (c) => storeController.updateInventory(c));
router.delete('/inventory/:id', auth('store'), (c) => storeController.deleteInventory(c));
router.get('/inventory/stats', auth('store'), (c) => storeController.inventoryStats(c));

// Stats & subscription (shared with dealer service)
router.get('/stats', auth('store'), (c) => storeController.stats(c));
router.get('/subscription', auth('store'), (c) => storeController.subscription(c));

export { router as storeRouter };
