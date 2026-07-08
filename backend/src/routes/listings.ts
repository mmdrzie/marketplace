import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { listingService } from '../domain/services/listing';
import { favoriteRepo } from '../repositories/favorite';
import { auth, optionalAuth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { AppError } from '../errors';

const router = new Hono();

const createListingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().int().min(0).optional(),
  price_type: z.enum(['fixed', 'negotiable', 'auction']).optional(),
  category_id: z.number().int().positive(),
  province_id: z.number().int().positive().optional(),
  city_id: z.number().int().positive().optional(),
  attributes: z.array(z.object({ attribute_id: z.number().int().positive(), value: z.string() })).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    thumbnail_url: z.string().optional(),
    medium_url: z.string().optional(),
    is_primary: z.boolean().optional(),
    sort_order: z.number().int().min(0).optional(),
  })).optional(),
});

const updateListingSchema = createListingSchema.partial().omit({ images: true, attributes: true });

const actionSchema = z.object({
  action: z.enum(['submit', 'sold', 'renew', 'approve', 'reject']),
});

// GET /listings — public listing list with filters
router.get('/', optionalAuth(), async (c) => {
  const query = c.req.query();
  const user = c.get('user');

  const scope = query.scope;
  if (scope === 'me' && !user) throw AppError.unauthorized();

  const result = await listingService.list({
    scope: query.scope,
    category: query.category,
    province: query.province,
    status: query.status,
    min_price: query.min_price ? parseInt(query.min_price, 10) : undefined,
    max_price: query.max_price ? parseInt(query.max_price, 10) : undefined,
    sort: query.sort,
    page: query.page ? parseInt(query.page, 10) : undefined,
    perPage: query.per_page ? parseInt(query.per_page, 10) : undefined,
    user,
  });

  return c.json({
    success: true,
    data: result.data,
    meta: {
      current_page: result.page,
      last_page: result.lastPage,
      per_page: 24,
      total: result.total,
    },
  });
});

// GET /listings/:slug — full listing detail
router.get('/:slug', optionalAuth(), async (c) => {
  const slug = c.req.param('slug');
  const listing = await listingService.getBySlug(slug);
  return c.json({ success: true, data: listing });
});

// POST /listings — create draft (phone gate)
router.post('/', auth(), rateLimiter('publishListing'), zValidator('json', createListingSchema), async (c) => {
  const body = c.req.valid('json');
  const listing = await listingService.create({ ...body, user: c.get('user') });
  return c.json({ success: true, data: listing }, 201);
});

// PUT /listings/:id — update listing
router.put('/:id', auth(), zValidator('json', updateListingSchema), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const body = c.req.valid('json');
  const listing = await listingService.update({ id, data: body, user: c.get('user') });
  return c.json({ success: true, data: listing });
});

// DELETE /listings/:id — soft delete
router.delete('/:id', auth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  await listingService.delete(id, c.get('user'));
  return c.json({ success: true, data: null });
});

// PATCH /listings/:id — status actions (submit, sold, renew, approve, reject)
router.patch('/:id', auth(), zValidator('json', actionSchema), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { action } = c.req.valid('json');
  const user = c.get('user');

  let listing;
  switch (action) {
    case 'submit':
      listing = await listingService.submit(id, user);
      break;
    case 'sold':
      listing = await listingService.markSold(id, user);
      break;
    case 'renew':
      listing = await listingService.renew(id, user);
      break;
    case 'approve':
      listing = await listingService.approve(id, user);
      break;
    case 'reject':
      listing = await listingService.reject(id, user);
      break;
  }

  return c.json({ success: true, data: listing });
});

// POST /listings/:id/favorite — toggle favorite
router.post('/:id/favorite', auth(), async (c) => {
  const listingId = parseInt(c.req.param('id'), 10);
  const result = await favoriteRepo.toggle(c.get('user').id, listingId);
  return c.json({ success: true, data: result }, result.favorited ? 201 : 200);
});

// POST /listings/:id/report — report listing
router.post('/:id/report', auth(), async (c) => {
  const listingId = parseInt(c.req.param('id'), 10);
  const userId = c.get('user').id;

  const db = (await import('../config/database')).getDb;
  const d = await db();
  await d.query(
    'INSERT INTO reports (user_id, listing_id) VALUES ($1, $2)',
    [userId, listingId],
  );

  return c.json({ success: true, data: { reported: true } }, 201);
});

export { router as listingRouter };
