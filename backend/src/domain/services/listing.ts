import { listingRepo } from '../../repositories/listing';
import type { ListingRow } from '../../repositories/listing';
import { categoryRepo } from '../../repositories/category';
import { permissionService } from '../../services/permission';
import { cache } from '../../services/cache';
import { eventBus, ListingCreated, ListingUpdated, ListingDeleted, ListingStatusChanged } from '../events';
import { AppError } from '../../errors';
import type { AuthUser } from '../../middleware/auth';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100) || 'listing';
}

export class ListingService {
  async list(filters: {
    scope?: string;
    category?: string;
    province?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
    sort?: string;
    page?: number;
    perPage?: number;
    user?: AuthUser;
  }): Promise<{ data: ListingRow[]; total: number; page: number; lastPage: number }> {
    const cacheKey = `listings:${JSON.stringify(filters)}`;
    const cached = cache.get<{ data: ListingRow[]; total: number; page: number; lastPage: number }>(cacheKey);
    if (cached && filters.scope !== 'me') return cached;

    const result = await listingRepo.findAll({
      ...filters,
      userId: filters.user?.id,
    } as Record<string, unknown> as Parameters<typeof listingRepo.findAll>[0]);

    if (filters.scope !== 'me') {
      cache.set(cacheKey, result, 15000);
    }

    return result;
  }

  async getBySlug(slug: string) {
    const cacheKey = `listing:${slug}`;
    const cached = cache.get<any>(cacheKey);
    if (cached) return cached;

    const listing = await listingRepo.findBySlug(slug);
    if (!listing) throw AppError.notFound('Listing not found');

    const [attributes, images] = await Promise.all([
      listingRepo.findAttributes(listing.id),
      listingRepo.findImages(listing.id),
    ]);

    const result = { ...listing, attributes, images };
    cache.set(cacheKey, result, 15000);

    listingRepo.incrementViews(listing.id).catch(() => {});

    return result;
  }

  async create(input: {
    title: string;
    description?: string;
    price?: number;
    price_type?: string;
    category_id: number;
    province_id?: number;
    city_id?: number;
    attributes?: { attribute_id: number; value: string }[];
    images?: { url: string; thumbnail_url?: string; medium_url?: string; is_primary?: boolean; sort_order?: number }[];
    user: AuthUser;
  }) {
    permissionService.requireCapability('listing:publish', input.user);

    const category = await categoryRepo.findById(input.category_id);
    if (!category) throw AppError.notFound('Category not found');

    const slug = generateSlug(input.title);

    const listing = await listingRepo.create({
      user_id: input.user.id,
      category_id: input.category_id,
      title: input.title,
      slug,
      description: input.description,
      price: input.price,
      price_type: (input.price_type as 'fixed' | 'negotiable' | 'auction') || 'fixed',
      province_id: input.province_id ?? null,
      city_id: input.city_id ?? null,
      status: 'draft',
    });

    if (input.attributes?.length) {
      await listingRepo.setAttributes(listing.id, input.attributes);
    }

    if (input.images?.length) {
      for (const img of input.images) {
        await listingRepo.addImage(listing.id, img);
      }
    }

    eventBus.publish(ListingCreated, { listingId: String(listing.id), userId: input.user.id });

    return listing;
  }

  async update(input: {
    id: number;
    data: Record<string, unknown>;
    attributes?: { attribute_id: number; value: string }[];
    user: AuthUser;
  }) {
    const listing = await listingRepo.findById(input.id);
    if (!listing) throw AppError.notFound('Listing not found');
    if (listing.user_id !== input.user.id) throw AppError.forbidden('You can only edit your own listings');

    const updated = await listingRepo.update(input.id, input.data);

    if (input.attributes) {
      await listingRepo.setAttributes(input.id, input.attributes);
    }

    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern('listings:');

    eventBus.publish(ListingUpdated, { listingId: String(input.id), userId: input.user.id });

    return updated;
  }

  async delete(id: number, user: AuthUser) {
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound('Listing not found');
    if (listing.user_id !== user.id && user.role !== 'admin') {
      throw AppError.forbidden('You can only delete your own listings');
    }

    await listingRepo.softDelete(id);
    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern('listings:');
    eventBus.publish(ListingDeleted, { listingId: String(id), userId: user.id });
  }

  async submit(id: number, user: AuthUser) {
    permissionService.requireCapability('listing:submit', user);

    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound('Listing not found');
    if (listing.user_id !== user.id) throw AppError.forbidden('You can only submit your own listings');
    if (listing.status !== 'draft') throw AppError.validation('Only draft listings can be submitted');

    const oldStatus = listing.status;
    const updated = await listingRepo.updateStatus(id, 'pending');

    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern('listings:');
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: 'pending',
    });

    return updated;
  }

  async approve(id: number, user: AuthUser) {
    if (user.role !== 'admin') throw AppError.forbidden('Admin access required');

    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound('Listing not found');
    if (listing.status !== 'pending') throw AppError.validation('Only pending listings can be approved');

    const oldStatus = listing.status;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updated = await listingRepo.updateStatus(id, 'published', {
      published_at: now,
      expires_at: expiresAt,
    });

    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern('listings:');
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: 'published',
    });

    return updated;
  }

  async reject(id: number, user: AuthUser) {
    if (user.role !== 'admin') throw AppError.forbidden('Admin access required');

    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound('Listing not found');
    if (listing.status !== 'pending') throw AppError.validation('Only pending listings can be rejected');

    const oldStatus = listing.status;
    const updated = await listingRepo.updateStatus(id, 'rejected');

    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern('listings:');
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: 'rejected',
    });

    return updated;
  }

  async markSold(id: number, user: AuthUser) {
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound('Listing not found');
    if (listing.user_id !== user.id) throw AppError.forbidden('You can only mark your own listings as sold');
    if (listing.status !== 'published') throw AppError.validation('Only published listings can be marked as sold');

    const oldStatus = listing.status;
    const updated = await listingRepo.updateStatus(id, 'sold');

    cache.invalidate(`listing:listing.slug`);
    cache.invalidatePattern('listings:');
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: 'sold',
    });

    return updated;
  }

  async renew(id: number, user: AuthUser) {
    const listing = await listingRepo.findById(id);
    if (!listing) throw AppError.notFound('Listing not found');
    if (listing.user_id !== user.id) throw AppError.forbidden('You can only renew your own listings');
    if (listing.status !== 'published' && listing.status !== 'sold') {
      throw AppError.validation('Only published or sold listings can be renewed');
    }

    const oldStatus = listing.status;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const updated = await listingRepo.updateStatus(id, 'published', {
      published_at: new Date().toISOString(),
      expires_at: expiresAt,
    });

    cache.invalidate(`listing:${listing.slug}`);
    cache.invalidatePattern('listings:');
    eventBus.publish(ListingStatusChanged, {
      listingId: String(id),
      userId: user.id,
      oldStatus,
      newStatus: 'published',
    });

    return updated;
  }

  async search(q: string, filters: {
    category?: string;
    province?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<{ data: ListingRow[]; total: number }> {
    const cacheKey = `search:${q}:${JSON.stringify(filters)}`;
    const cached = cache.get<{ data: ListingRow[]; total: number }>(cacheKey);
    if (cached) return cached;
    const result = await listingRepo.search(q, filters);
    cache.set(cacheKey, result, 30000);
    return result;
  }
}

export const listingService = new ListingService();
