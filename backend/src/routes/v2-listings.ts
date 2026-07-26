'use strict';

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { listingController } from '../container.js';
import { auth, optionalAuth } from '../middleware/auth.js';

const router = new Hono();

const createSchema = z.object({
  categoryId: z.number().int().positive(),
  provinceId: z.number().int().positive().optional(),
  cityId: z.number().int().positive().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().int().min(0).optional(),
  priceType: z.enum(['fixed', 'negotiable', 'auction']).optional(),
  vehicleVariantId: z.number().int().positive().optional(),
});

const updateSchema = createSchema.partial();

router.get('/', optionalAuth(), (c) => listingController.list(c));
router.get('/:slug', optionalAuth(), (c) => listingController.getBySlug(c));
router.post('/', auth(), zValidator('json', createSchema), (c) => listingController.create(c));
router.put('/:id', auth(), zValidator('json', updateSchema), (c) => listingController.update(c));
router.delete('/:id', auth(), (c) => listingController.delete(c));
router.patch('/:id', auth(), (c) => listingController.submit(c));

export { router as listingV2Router };
