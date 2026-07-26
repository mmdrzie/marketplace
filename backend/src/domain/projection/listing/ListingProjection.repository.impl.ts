import { getDb } from '../../../config/database.js';
import type { ListingProjectionRow, ListingProjectionFilter, ListingProjectionRepository } from './ListingProjection.js';

export class ListingProjectionRepositoryImpl implements ListingProjectionRepository {
  async findBySlug(slug: string): Promise<ListingProjectionRow | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM listing_projection WHERE slug = $1', [slug]);
    if (!rows.length) return null;
    return this.toRow(rows[0] as Record<string, unknown>);
  }

  async findAll(filter: ListingProjectionFilter): Promise<{ items: ListingProjectionRow[]; total: number }> {
    const db = await getDb();
    const conditions: string[] = ['status = \'published\''];
    const params: unknown[] = [];
    let idx = 1;

    if (filter.categoryId) { conditions.push(`category_id = $${idx++}`); params.push(filter.categoryId); }
    if (filter.provinceId) { conditions.push(`province_id = $${idx++}`); params.push(filter.provinceId); }
    if (filter.brandId) { conditions.push(`brand_id = $${idx++}`); params.push(filter.brandId); }
    if (filter.modelId) { conditions.push(`model_id = $${idx++}`); params.push(filter.modelId); }
    if (filter.priceMin) { conditions.push(`price >= $${idx++}`); params.push(filter.priceMin); }
    if (filter.priceMax) { conditions.push(`price <= $${idx++}`); params.push(filter.priceMax); }

    const where = conditions.join(' AND ');
    const limit = filter.limit ?? 20;
    const offset = ((filter.page ?? 1) - 1) * limit;
    const sort = filter.sort === 'price_asc' ? 'price ASC' : filter.sort === 'price_desc' ? 'price DESC' : 'published_at DESC';

    const { rows } = await db.query(
      `SELECT * FROM listing_projection WHERE ${where} ORDER BY ${sort} LIMIT $${idx++} OFFSET $${idx++}`,
      [...params, limit, offset],
    );
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) as count FROM listing_projection WHERE ${where}`, params,
    );

    return {
      items: (rows as Record<string, unknown>[]).map(r => this.toRow(r)),
      total: Number((countRows[0] as Record<string, unknown>).count),
    };
  }

  async upsert(row: ListingProjectionRow): Promise<void> {
    const db = await getDb();
    await db.query(
      `INSERT INTO listing_projection (id, slug, title, description, price, price_type, status, is_featured, views,
        primary_image, category_id, category_name, province_id, province_name, city_id, city_name,
        user_id, user_name, user_phone, dealer_name, dealer_phone,
        vehicle_variant_id, brand_name, model_name, variant_name, published_at, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
       ON CONFLICT (id) DO UPDATE SET
         title=EXCLUDED.title, slug=EXCLUDED.slug, price=EXCLUDED.price, price_type=EXCLUDED.price_type,
         status=EXCLUDED.status, is_featured=EXCLUDED.is_featured, views=EXCLUDED.views,
         primary_image=EXCLUDED.primary_image, category_name=EXCLUDED.category_name,
         brand_name=EXCLUDED.brand_name, model_name=EXCLUDED.model_name, variant_name=EXCLUDED.variant_name,
         dealer_name=EXCLUDED.dealer_name, dealer_phone=EXCLUDED.dealer_phone,
         published_at=EXCLUDED.published_at`,
      [row.id, row.slug, row.title, row.description, row.price, row.priceType,
       row.status, row.isFeatured, row.views, row.primaryImage,
       row.categoryId, row.categoryName, row.provinceId, row.provinceName,
       row.cityId, row.cityName, row.userId, row.userName, row.userPhone,
       row.dealerName, row.dealerPhone, row.vehicleVariantId,
       row.brandName, row.modelName, row.variantName,
       row.publishedAt, row.createdAt],
    );
  }

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM listing_projection WHERE id = $1', [id]);
  }

  private toRow(r: Record<string, unknown>): ListingProjectionRow {
    return {
      id: r.id as number, slug: r.slug as string, title: r.title as string,
      description: r.description as string, price: r.price as number,
      priceType: r.price_type as string, status: r.status as string,
      isFeatured: r.is_featured as boolean, views: r.views as number,
      primaryImage: r.primary_image as string | null,
      categoryId: r.category_id as number, categoryName: r.category_name as string | null,
      provinceId: r.province_id as number | null, provinceName: r.province_name as string | null,
      cityId: r.city_id as number | null, cityName: r.city_name as string | null,
      userId: r.user_id as string, userName: r.user_name as string | null,
      userPhone: r.user_phone as string | null,
      dealerName: r.dealer_name as string | null, dealerPhone: r.dealer_phone as string | null,
      vehicleVariantId: r.vehicle_variant_id as number | null,
      brandName: r.brand_name as string | null, modelName: r.model_name as string | null,
      variantName: r.variant_name as string | null,
      publishedAt: r.published_at as string | null, createdAt: r.created_at as string,
    };
  }
}
