import { getDb } from '../../../config/database.js';
import { Dealer } from '../../entities/dealer/Dealer.entity.js';
import type { DealerRepository } from '../../entities/dealer/Dealer.repository.js';
import type { DealerStats, DealerSubscription } from '../../entities/dealer/Dealer.repository.js';

export class DealerRepositoryImpl implements DealerRepository {
  async findById(id: number): Promise<Dealer | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM dealer_profiles WHERE id = $1', [id]);
    if (!rows.length) return null;
    return Dealer.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByUserId(userId: string): Promise<Dealer | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM dealer_profiles WHERE user_id = $1', [userId]);
    if (!rows.length) return null;
    return Dealer.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async save(dealer: Dealer): Promise<void> {
    const db = await getDb();
    const s = dealer.snapshot();

    const existing = await this.findById(s.id).catch(() => null);
    if (!existing) {
      await db.query(
        `INSERT INTO dealer_profiles (user_id, name, slug, business_name, logo, description, phone, address, latitude, longitude, dealer_code, subscription_plan, subscription_expires_at, listings_limit, is_verified, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [s.userId, s.name, s.slug, s.businessName, s.logo, s.description, s.phone, s.address, s.latitude, s.longitude, s.dealerCode, s.subscriptionPlan, s.subscriptionExpiresAt, s.listingsLimit, s.isVerified, s.isActive],
      );
    } else {
      await db.query(
        `UPDATE dealer_profiles SET name=$1, business_name=$2, logo=$3, description=$4, phone=$5, address=$6,
         latitude=$7, longitude=$8, dealer_code=$9, subscription_plan=$10, subscription_expires_at=$11,
         listings_limit=$12, is_verified=$13, is_active=$14, updated_at=NOW()
         WHERE id=$15`,
        [s.name, s.businessName, s.logo, s.description, s.phone, s.address, s.latitude, s.longitude, s.dealerCode, s.subscriptionPlan, s.subscriptionExpiresAt, s.listingsLimit, s.isVerified, s.isActive, s.id],
      );
    }
  }

  async getStats(userId: string): Promise<DealerStats> {
    const db = await getDb();
    const [listingsRes, reviewsRes, todayViewsRes, contactsRes, unreadRes, activitiesRes] = await Promise.all([
      db.query(
        `SELECT COUNT(*) as total_listings, COUNT(*) FILTER (WHERE status = 'published') as active_listings,
                COUNT(*) FILTER (WHERE status = 'sold') as sold_listings, COALESCE(SUM(views), 0) as total_views
         FROM listings WHERE user_id = $1 AND deleted_at IS NULL`,
        [userId],
      ),
      db.query(
        `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews FROM dealer_reviews WHERE dealer_id = $1`,
        [userId],
      ),
      db.query(
        `SELECT COALESCE(SUM(v.views), 0) as today_views FROM listing_views_daily v
         JOIN listings l ON l.id = v.listing_id WHERE l.user_id = $1 AND v.date = CURRENT_DATE`,
        [userId],
      ),
      db.query(
        `SELECT COUNT(*) as today_contacts FROM messages m JOIN conversations c ON c.id = m.conversation_id
         WHERE (c.buyer_id = $1 OR c.seller_id = $1) AND m.sender_id != $1 AND m.created_at >= CURRENT_DATE`,
        [userId],
      ),
      db.query(
        `SELECT COUNT(*) as unread_messages FROM messages m JOIN conversations c ON c.id = m.conversation_id
         WHERE (c.buyer_id = $1 OR c.seller_id = $1) AND m.sender_id != $1 AND m.is_read = false`,
        [userId],
      ),
      db.query(
        `SELECT id, title, status, created_at FROM listings
         WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`,
        [userId],
      ),
    ]);

    const l = listingsRes.rows[0] as Record<string, string>;
    const r = reviewsRes.rows[0] as Record<string, string>;
    return {
      total_listings: parseInt(l.total_listings, 10),
      active_listings: parseInt(l.active_listings, 10),
      sold_listings: parseInt(l.sold_listings, 10),
      total_views: parseInt(l.total_views, 10),
      avg_rating: parseFloat(r.avg_rating),
      total_reviews: parseInt(r.total_reviews, 10),
      today_views: parseInt((todayViewsRes.rows[0] as Record<string, string> | undefined)?.today_views ?? '0', 10),
      today_contacts: parseInt((contactsRes.rows[0] as Record<string, string> | undefined)?.today_contacts ?? '0', 10),
      unread_messages: parseInt((unreadRes.rows[0] as Record<string, string> | undefined)?.unread_messages ?? '0', 10),
      recent_activities: (activitiesRes.rows as Array<{ id: number; title: string; status: string; created_at: string }>).map(a => ({
        id: a.id,
        description: `ثبت آگهی «${a.title}»`,
        status: a.status,
        created_at: a.created_at,
      })),
    };
  }

  async getSubscription(userId: string): Promise<DealerSubscription | null> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT dp.*, u.role FROM dealer_profiles dp JOIN users u ON u.id = dp.user_id WHERE dp.user_id = $1`,
      [userId],
    );
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return {
      user_id: r.user_id as string,
      business_name: r.business_name as string,
      logo: r.logo as string | null,
      address: r.address as string | null,
      description: r.description as string | null,
      dealer_code: r.dealer_code as string | null,
      subscription_plan: (r.subscription_plan as string) ?? 'free',
      subscription_expires_at: r.subscription_expires_at as string | null,
      listings_limit: (r.listings_limit as number) ?? 0,
      is_verified: r.is_verified as boolean,
      role: r.role as string,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }

  async addReview(data: { dealer_id: string; user_id: string; rating: number; comment?: string }): Promise<Record<string, unknown>> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO dealer_reviews (dealer_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.dealer_id, data.user_id, data.rating, data.comment ?? ''],
    );
    return rows[0] as Record<string, unknown>;
  }

  private toSnapshot(r: Record<string, unknown>) {
    return {
      id: r.id as number, userId: r.user_id as string, name: r.name as string,
      slug: r.slug as string, businessName: r.business_name as string | null,
      logo: r.logo as string | null, description: r.description as string | null,
      phone: r.phone as string | null, address: r.address as string | null,
      latitude: r.latitude as number | null, longitude: r.longitude as number | null,
      dealerCode: r.dealer_code as string | null,
      subscriptionPlan: r.subscription_plan as string | null,
      subscriptionExpiresAt: r.subscription_expires_at as string | null,
      listingsLimit: r.listings_limit as number | null,
      isVerified: r.is_verified as boolean, isActive: r.is_active as boolean,
      rating: r.rating as number, reviewCount: r.review_count as number,
      publicId: r.public_id as string | null,
      createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    };
  }
}
