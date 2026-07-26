import { getDb } from '../../../config/database.js';
import { Listing, ListingSnapshot } from '../../entities/listing/Listing.entity.js';
import type { ListingRepository, ListingsQuery, ListingDetails } from '../../entities/listing/Listing.repository.js';
import { ListingAttribute } from '../../entities/listing/ListingAttribute.entity.js';
import { ListingMedia } from '../../entities/listing/ListingMedia.entity.js';

function rowToSnapshot(row: Record<string, unknown>): ListingSnapshot {
  return {
    id: row.id as number, userId: row.user_id as string,
    categoryId: row.category_id as number, provinceId: row.province_id as number,
    cityId: row.city_id as number, title: row.title as string,
    slug: row.slug as string, description: row.description as string,
    price: row.price as number, priceType: row.price_type as string,
    status: row.status as string, isFeatured: row.is_featured as boolean,
    views: row.views as number, primaryImage: row.primary_image as string | null,
    vehicleVariantId: row.vehicle_variant_id as number | null,
    version: row.version as number,
    publishedAt: row.published_at as string | null,
    expiresAt: row.expires_at as string | null,
    createdAt: row.created_at as string, updatedAt: row.updated_at as string,
    deletedAt: row.deleted_at as string | null,
  };
}

export class ListingRepositoryImpl implements ListingRepository {
  async findById(id: number): Promise<Listing | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM listings WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (!rows.length) return null;
    return Listing.fromSnapshot(rowToSnapshot(rows[0] as Record<string, unknown>));
  }

  async findBySlug(slug: string): Promise<Listing | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM listings WHERE slug = $1 AND deleted_at IS NULL', [slug]);
    if (!rows.length) return null;
    return Listing.fromSnapshot(rowToSnapshot(rows[0] as Record<string, unknown>));
  }

  async findAll(query: ListingsQuery): Promise<{ items: Listing[]; total: number }> {
    const db = await getDb();
    const conditions: string[] = ['l.deleted_at IS NULL'];
    const params: unknown[] = [];
    let idx = 1;

    if (query.scope === 'me' && query.userId) {
      conditions.push(`l.user_id = $${idx++}`);
      params.push(query.userId);
    } else if (!query.status) {
      conditions.push(`l.status = $${idx++}`);
      params.push('published');
    }
    if (query.categoryId) { conditions.push(`l.category_id = $${idx++}`); params.push(query.categoryId); }
    if (query.provinceId) { conditions.push(`l.province_id = $${idx++}`); params.push(query.provinceId); }
    if (query.cityId) { conditions.push(`l.city_id = $${idx++}`); params.push(query.cityId); }
    if (query.status) { conditions.push(`l.status = $${idx++}`); params.push(query.status); }
    if (query.priceMin) { conditions.push(`l.price >= $${idx++}`); params.push(query.priceMin); }
    if (query.priceMax) { conditions.push(`l.price <= $${idx++}`); params.push(query.priceMax); }
    if (query.brandId) { conditions.push(`EXISTS (SELECT 1 FROM listing_attributes la JOIN attributes a ON a.id = la.attribute_id WHERE la.listing_id = l.id AND a.name = 'brand' AND la.value::int = $${idx++})`); params.push(query.brandId); }
    if (query.modelId) { conditions.push(`EXISTS (SELECT 1 FROM listing_attributes la JOIN attributes a ON a.id = la.attribute_id WHERE la.listing_id = l.id AND a.name = 'model' AND la.value::int = $${idx++})`); params.push(query.modelId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = query.limit ?? 20;
    const offset = ((query.page ?? 1) - 1) * limit;
    const sort = query.sort === 'price_asc' ? 'l.price ASC' : query.sort === 'price_desc' ? 'l.price DESC' : 'l.created_at DESC';

    const { rows } = await db.query(
      `SELECT l.* FROM listings l ${where} ORDER BY ${sort} LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) as count FROM listings l ${where}`, params,
    );

    return {
      items: (rows as Record<string, unknown>[]).map(rowToSnapshot).map(s => Listing.fromSnapshot(s)),
      total: Number((countRows[0] as Record<string, unknown>).count),
    };
  }

  async save(listing: Listing): Promise<void> {
    const db = await getDb();
    const s = listing.snapshot();

    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO listings (user_id, category_id, province_id, city_id, title, slug, description, price, price_type, status, is_featured, vehicle_variant_id, version)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
        [s.userId, s.categoryId, s.provinceId, s.cityId, s.title, s.slug,
         s.description, s.price, s.priceType, s.status, s.isFeatured, s.vehicleVariantId, s.version],
      );
      (listing as any).id = (rows[0] as Record<string, unknown>).id;
    } else {
      const prevVersion = s.version - 1;
      const { rowCount } = await db.query(
        `UPDATE listings SET title=$1, slug=$2, description=$3, price=$4, price_type=$5,
         category_id=$6, province_id=$7, city_id=$8, status=$9, is_featured=$10,
         primary_image=$11, vehicle_variant_id=$12, version=$13, updated_at=NOW()
         WHERE id=$14 AND version=$15 AND deleted_at IS NULL`,
        [s.title, s.slug, s.description, s.price, s.priceType,
         s.categoryId, s.provinceId, s.cityId, s.status, s.isFeatured,
         s.primaryImage, s.vehicleVariantId, s.version, s.id, prevVersion],
      );
      if (rowCount === 0) throw new Error('Optimistic lock failure: listing was modified by another transaction');
    }
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE listings SET deleted_at = NOW() WHERE id = $1', [id]);
  }

  async getDetails(id: number): Promise<ListingDetails | null> {
    const listing = await this.findById(id);
    if (!listing) return null;
    const db = await getDb();
    const [attrRows, mediaRows] = await Promise.all([
      db.query(
        `SELECT la.attribute_id, la.value FROM listing_attributes la WHERE la.listing_id = $1`,
        [id],
      ),
      db.query(
        `SELECT id, url, thumbnail_url, medium_url, is_primary, sort_order FROM listing_images WHERE listing_id = $1 ORDER BY sort_order, id`,
        [id],
      ),
    ]);
    const attributes = (attrRows.rows as Record<string, unknown>[]).map(r =>
      new ListingAttribute(r.attribute_id as number, r.value as string),
    );
    const media = (mediaRows.rows as Record<string, unknown>[]).map(r =>
      new ListingMedia(r.id as number, r.url as string, 'IMAGE',
        r.is_primary as boolean, r.sort_order as number,
        r.thumbnail_url as string | null, null, null, null, null),
    );
    return { listing, attributes, media };
  }
}
