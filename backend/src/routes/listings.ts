import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { unlink } from 'node:fs/promises';
import { listingRepo } from '../repositories/listing.js';
import { categoryRepo } from '../repositories/category.js';
import { favoriteRepo } from '../repositories/favorite.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { AppError } from '../errors.js';
import { permissionService } from '../services/permission/index.js';
import { cache } from '../services/cache/index.js';
import { config } from '../config/index.js';
import { generateSlug } from '../utils/slug.js';
import { OutboxWriter } from '../domain/infrastructure/outbox/OutboxPublisher.js';
import { OutboxRepositoryImpl } from '../domain/infrastructure/outbox/OutboxRepository.impl.js';

const router = new Hono();
const outboxWriter = new OutboxWriter(new OutboxRepositoryImpl());

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
    url: z.string(),
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

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  for (let attempt = 1; attempt <= 10; attempt++) {
    const existing = await listingRepo.findBySlug(slug);
    if (!existing) return slug;
    const suffix = Math.random().toString(36).slice(2, 8);
    slug = `${baseSlug}-${suffix}`;
  }
  return `${baseSlug}-${Date.now()}`;
}

async function deleteMediaFile(url: string) {
  if (config.storage.provider === 'local' && url.startsWith('/uploads/')) {
    const safePath = `./${url}`;
    if (!safePath.includes('..') && /^(\.\/uploads\/)[a-zA-Z0-9._\-\/]+$/.test(safePath)) {
      await unlink(safePath).catch(() => {});
    }
  }
}

// GET /listings — public listing list with filters
router.get('/', optionalAuth(), async (c) => {
  const query = c.req.query();
  const user = c.get('user');

  const scope = query.scope;
  if (scope === 'me' && !user) throw AppError.unauthorized();

  const requestedStatus = query.status;
  if (requestedStatus && (!user || user.role !== 'admin')) {
    throw AppError.forbidden('Only admins can filter by status');
  }

  const minPrice = query.min_price ?? query.price_min;
  const maxPrice = query.max_price ?? query.price_max;

  const parseIntOrUndefined = (v: string | undefined): number | undefined => {
    if (v === undefined) return undefined;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? undefined : n;
  };

  const filters: Parameters<typeof listingRepo.findAll>[0] = {
    scope: query.scope as 'me' | undefined,
    userId: user?.id,
    category: query.category,
    province: query.province,
    status: requestedStatus,
    min_price: parseIntOrUndefined(minPrice),
    max_price: parseIntOrUndefined(maxPrice),
    city_id: query.city_id,
    brand: query.brand,
    model: query.model,
    year_from: query.year_from,
    year_to: query.year_to,
    sort: query.sort as Parameters<typeof listingRepo.findAll>[0]['sort'],
    page: parseIntOrUndefined(query.page),
    perPage: parseIntOrUndefined(query.per_page),
  };

  const perPage = filters.perPage ?? 24;
  const cacheKey = `listings:${JSON.stringify(filters)}`;
  const cached = cache.get<{ data: unknown[]; total: number; page: number; lastPage: number }>(cacheKey);
  if (cached && scope !== 'me') {
    return c.json({
      success: true,
      data: cached.data,
      meta: {
        current_page: cached.page,
        last_page: cached.lastPage,
        per_page: perPage,
        total: cached.total,
      },
    });
  }

  const result = await listingRepo.findAll(filters);

  if (scope !== 'me') {
    cache.set(cacheKey, result, 15000);
  }

  return c.json({
    success: true,
    data: result.data,
    meta: {
      current_page: result.page,
      last_page: result.lastPage,
      per_page: perPage,
      total: result.total,
    },
  });
});

// GET /listings/:slug — full listing detail
router.get('/:slug', optionalAuth(), async (c) => {
  const slug = c.req.param('slug');

  const cacheKey = `listing:${slug}`;
  const cached = cache.get(cacheKey);
  if (cached) return c.json({ success: true, data: cached });

  if (!slug) throw AppError.notFound('Listing not found');
  const listing = await listingRepo.findBySlug(slug);
  if (!listing) throw AppError.notFound('Listing not found');

  const [attributes, images] = await Promise.all([
    listingRepo.findAttributes(listing.id),
    listingRepo.findImages(listing.id),
  ]);

  const result = { ...listing, attributes, images };
  cache.set(cacheKey, result, 15000);

  listingRepo.incrementViews(listing.id).catch(() => {});

  return c.json({ success: true, data: result });
});

// POST /listings — create draft (phone gate)
router.post('/', auth(), rateLimiter('publishListing'), zValidator('json', createListingSchema), async (c) => {
  const body = c.req.valid('json');
  const user = c.get('user');

  permissionService.requireCapability('listing:publish', user);

  const category = await categoryRepo.findById(body.category_id);
  if (!category) throw AppError.notFound('Category not found');

  const baseSlug = generateSlug(body.title);
  const slug = await ensureUniqueSlug(baseSlug);

  const listing = await listingRepo.create({
    user_id: user.id,
    category_id: body.category_id,
    title: body.title,
    slug,
    description: body.description,
    price: body.price,
    price_type: body.price_type || 'fixed',
    province_id: body.province_id ?? null,
    city_id: body.city_id ?? null,
  });

  if (body.attributes?.length) {
    await listingRepo.setAttributes(listing.id, body.attributes);
  }

  if (body.images?.length) {
    await listingRepo.addImages(listing.id, body.images);
  }

  await outboxWriter.write({
    aggregateType: 'listing', aggregateId: String(listing.id),
    eventType: 'listing.created',
    payload: { listingId: listing.id, userId: user.id, title: listing.title },
    metadata: {},
  });

  return c.json({ success: true, data: listing }, 201);
});

// PUT /listings/:id — update listing
router.put('/:id', auth(), zValidator('json', updateListingSchema), async (c) => {
  const id = parseInt(c.req.param('id')!, 10);
  const body = c.req.valid('json');
  const user = c.get('user');

  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound('Listing not found');
  if (listing.user_id !== user.id) throw AppError.forbidden('You can only edit your own listings');

  const updated = await listingRepo.update(id, body);

  cache.invalidate(`listing:${listing.slug}`);
  cache.invalidatePattern('listings:');

  await outboxWriter.write({
    aggregateType: 'listing', aggregateId: String(id),
    eventType: 'listing.updated',
    payload: { listingId: id, userId: user.id },
    metadata: {},
  });

  return c.json({ success: true, data: updated });
});

// DELETE /listings/:id — soft delete
router.delete('/:id', auth(), async (c) => {
  const id = parseInt(c.req.param('id')!, 10);
  const user = c.get('user');

  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound('Listing not found');
  if (listing.user_id !== user.id && user.role !== 'admin') {
    throw AppError.forbidden('You can only delete your own listings');
  }

  const images = await listingRepo.findImages(id);
  await Promise.allSettled(images.map((img) => deleteMediaFile(img.url)));
  await listingRepo.softDelete(id);

  cache.invalidate(`listing:${listing.slug}`);
  cache.invalidatePattern('listings:');

  await outboxWriter.write({
    aggregateType: 'listing', aggregateId: String(id),
    eventType: 'listing.deleted',
    payload: { listingId: id, userId: user.id },
    metadata: {},
  });

  return c.json({ success: true, data: null });
});

// PATCH /listings/:id — status actions (submit, sold, renew, approve, reject)
router.patch('/:id', auth(), zValidator('json', actionSchema), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const { action } = c.req.valid('json');
  const user = c.get('user');

  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound('Listing not found');

  let updated;

  switch (action) {
    case 'submit': {
      permissionService.requireCapability('listing:submit', user);
      if (listing.user_id !== user.id) throw AppError.forbidden('You can only submit your own listings');
      if (listing.status !== 'draft') throw AppError.validation('Only draft listings can be submitted');
      updated = await listingRepo.updateStatus(id, 'pending');
      await outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(id),
        eventType: 'listing.submitted',
        payload: { listingId: id, userId: user.id, oldStatus: listing.status, newStatus: 'pending' },
        metadata: {},
      });
      break;
    }
    case 'sold': {
      if (listing.user_id !== user.id) throw AppError.forbidden('You can only mark your own listings as sold');
      if (listing.status !== 'published') throw AppError.validation('Only published listings can be marked as sold');
      updated = await listingRepo.updateStatus(id, 'sold');
      await outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(id),
        eventType: 'listing.sold',
        payload: { listingId: id, userId: user.id, oldStatus: listing.status, newStatus: 'sold' },
        metadata: {},
      });
      break;
    }
    case 'renew': {
      if (listing.user_id !== user.id) throw AppError.forbidden('You can only renew your own listings');
      if (listing.status !== 'published' && listing.status !== 'sold') {
        throw AppError.validation('Only published or sold listings can be renewed');
      }
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      updated = await listingRepo.updateStatus(id, 'published', {
        published_at: new Date().toISOString(),
        expires_at: expiresAt,
      });
      await outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(id),
        eventType: 'listing.renewed',
        payload: { listingId: id, userId: user.id, oldStatus: listing.status, newStatus: 'published' },
        metadata: {},
      });
      break;
    }
    case 'approve': {
      if (user.role !== 'admin') throw AppError.forbidden('Admin access required');
      if (listing.status !== 'pending') throw AppError.validation('Only pending listings can be approved');
      const now2 = new Date().toISOString();
      const expiresAt2 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      updated = await listingRepo.updateStatus(id, 'published', {
        published_at: now2,
        expires_at: expiresAt2,
      });
      await outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(id),
        eventType: 'listing.approved',
        payload: { listingId: id, userId: user.id, oldStatus: listing.status, newStatus: 'published' },
        metadata: {},
      });
      break;
    }
    case 'reject': {
      if (user.role !== 'admin') throw AppError.forbidden('Admin access required');
      if (listing.status !== 'pending') throw AppError.validation('Only pending listings can be rejected');
      updated = await listingRepo.updateStatus(id, 'rejected');
      await outboxWriter.write({
        aggregateType: 'listing', aggregateId: String(id),
        eventType: 'listing.rejected',
        payload: { listingId: id, userId: user.id, oldStatus: listing.status, newStatus: 'rejected' },
        metadata: {},
      });
      break;
    }
  }

  cache.invalidate(`listing:${listing.slug}`);
  cache.invalidatePattern('listings:');

  return c.json({ success: true, data: updated });
});

// POST /listings/:id/favorite — toggle favorite
router.post('/:id/favorite', auth(), async (c) => {
  const listingId = parseInt(c.req.param('id')!, 10);
  const result = await favoriteRepo.toggle(c.get('user').id, listingId);
  return c.json({ success: true, data: result }, result.favorited ? 201 : 200);
});

// POST /listings/:id/report — report listing
router.post('/:id/report', auth(), async (c) => {
  const listingId = parseInt(c.req.param('id')!, 10);
  const userId = c.get('user').id;

  const db = (await import('../config/database.js')).getDb;
  const d = await db();
  await d.query(
    'INSERT INTO reports (user_id, listing_id) VALUES ($1, $2)',
    [userId, listingId],
  );

  return c.json({ success: true, data: { reported: true } }, 201);
});

// GET /listings/:id/stats — listing stats (views, messages, favorites)
router.get('/:id/stats', auth(), async (c) => {
  const id = parseInt(c.req.param('id')!, 10);
  const listing = await listingRepo.findById(id);
  if (!listing) throw AppError.notFound('Listing not found');

  const user = c.get('user');
  if (listing.user_id !== user.id && user.role !== 'admin') {
    throw AppError.forbidden('You do not have permission to view this listing\'s stats');
  }

  const db = (await import('../config/database.js')).getDb;
  const d = await db();

  const { rows: dailyViews } = await d.query(
    `SELECT date, views FROM listing_views_daily WHERE listing_id = $1 AND date >= CURRENT_DATE - 90 ORDER BY date`,
    [id],
  );

   const { rows: msgCount } = await d.query(
     `SELECT COUNT(*) as count FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE c.listing_id = $1`,
     [id],
   );

   const { rows: favCount } = await d.query(
     `SELECT COUNT(*) as count FROM favorites WHERE listing_id = $1`,
     [id],
   );

   const msgRow = msgCount[0] as { count: string } | undefined;
   const favRow = favCount[0] as { count: string } | undefined;

   return c.json({
     success: true,
     data: {
       total_views: listing.views,
       total_messages: parseInt(msgRow?.count || '0', 10),
       total_favorites: parseInt(favRow?.count || '0', 10),
       daily_views: dailyViews,
     },
   });
});

export { router as listingRouter };
