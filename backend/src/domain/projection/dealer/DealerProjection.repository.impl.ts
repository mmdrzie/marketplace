import { getDb } from '../../../config/database.js';
import type { DealerProjectionRow, DealerProjectionRepository } from './DealerProjection.js';

export class DealerProjectionRepositoryImpl implements DealerProjectionRepository {
  async findBySlug(slug: string): Promise<DealerProjectionRow | null> {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT dp.*, (SELECT COUNT(*) FROM listings l WHERE l.user_id = dp.user_id AND l.status = 'published' AND l.deleted_at IS NULL) as listing_count
      FROM dealer_projection WHERE slug = $1
    `, [slug]);
    if (!rows.length) return null;
    return this.toRow(rows[0] as Record<string, unknown>);
  }

  async findAll(verifiedOnly = true): Promise<DealerProjectionRow[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM dealer_projection${verifiedOnly ? ' WHERE is_verified = true' : ''} ORDER BY rating DESC, review_count DESC`,
    );
    return (rows as Record<string, unknown>[]).map(r => this.toRow(r));
  }

  async upsert(row: DealerProjectionRow): Promise<void> {
    const db = await getDb();
    await db.query(
      `INSERT INTO dealer_projection (id, name, slug, description, phone, address, latitude, longitude,
        is_verified, rating, review_count, listing_count, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name, description=EXCLUDED.description, phone=EXCLUDED.phone,
         address=EXCLUDED.address, rating=EXCLUDED.rating,
         review_count=EXCLUDED.review_count, listing_count=EXCLUDED.listing_count,
         is_verified=EXCLUDED.is_verified`,
      [row.id, row.name, row.slug, row.description, row.phone, row.address,
       row.latitude, row.longitude, row.isVerified, row.rating, row.reviewCount,
       row.listingCount, row.createdAt],
    );
  }

  private toRow(r: Record<string, unknown>): DealerProjectionRow {
    return {
      id: r.id as number, name: r.name as string, slug: r.slug as string,
      description: r.description as string | null, phone: r.phone as string | null,
      address: r.address as string | null, latitude: r.latitude as number | null,
      longitude: r.longitude as number | null,
      isVerified: r.is_verified as boolean, rating: r.rating as number,
      reviewCount: r.review_count as number, listingCount: r.listing_count as number,
      createdAt: r.created_at as string,
    };
  }
}
