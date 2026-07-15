import { getDb } from '../config/database.js';

export interface DealerProfileRow {
  user_id: string;
  business_name: string;
  logo: string | null;
  address: string | null;
  description: string | null;
  dealer_code: string | null;
  subscription_plan: string;
  subscription_expires_at: string | null;
  listings_limit: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export class DealerRepository {
  async findByUserId(userId: string) {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM dealer_profiles WHERE user_id = $1', [userId]);
    return rows[0] as DealerProfileRow | undefined;
  }

  async create(data: {
    user_id: string;
    business_name: string;
    logo?: string;
    address?: string;
    description?: string;
    dealer_code?: string;
  }) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO dealer_profiles (user_id, business_name, logo, address, description, dealer_code)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.user_id, data.business_name, data.logo ?? null, data.address ?? null, data.description ?? null, data.dealer_code ?? `DLR-${Date.now().toString(36).toUpperCase()}`],
    );
    return rows[0] as DealerProfileRow;
  }

  async update(userId: string, data: Partial<DealerProfileRow>) {
    const fields: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    values.push(userId);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE dealer_profiles SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] as DealerProfileRow | undefined;
  }

  async getStats(userId: string) {
    const db = await getDb();
    const [listingsRes, reviewsRes, todayViewsRes, contactsRes, unreadRes, activitiesRes] = await Promise.all([
      db.query(
        `SELECT
           COUNT(*) as total_listings,
           COUNT(*) FILTER (WHERE status = 'published') as active_listings,
           COUNT(*) FILTER (WHERE status = 'sold') as sold_listings,
           COALESCE(SUM(views), 0) as total_views
         FROM listings WHERE user_id = $1 AND deleted_at IS NULL`,
        [userId],
      ),
      db.query(
        `SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews
         FROM dealer_reviews WHERE dealer_id = $1`,
        [userId],
      ),
      db.query(
        `SELECT COALESCE(SUM(v.views), 0) as today_views
         FROM listing_views_daily v
         JOIN listings l ON l.id = v.listing_id
         WHERE l.user_id = $1 AND v.date = CURRENT_DATE`,
        [userId],
      ),
      db.query(
        `SELECT COUNT(*) as today_contacts
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         WHERE (c.buyer_id = $1 OR c.seller_id = $1)
           AND m.sender_id != $1
           AND m.created_at >= CURRENT_DATE`,
        [userId],
      ),
      db.query(
        `SELECT COUNT(*) as unread_messages
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         WHERE (c.buyer_id = $1 OR c.seller_id = $1)
           AND m.sender_id != $1
           AND m.is_read = false`,
        [userId],
      ),
      db.query(
        `SELECT id, title, status, created_at
         FROM listings
         WHERE user_id = $1 AND deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT 5`,
        [userId],
      ),
    ]);

    const l = listingsRes.rows[0] as { total_listings: string; active_listings: string; sold_listings: string; total_views: string };
    const r = reviewsRes.rows[0] as { avg_rating: string; total_reviews: string };
    const tv = todayViewsRes.rows[0] as { today_views: string };
    const tc = contactsRes.rows[0] as { today_contacts: string };
    const um = unreadRes.rows[0] as { unread_messages: string };

    return {
      total_listings: parseInt(l.total_listings, 10),
      active_listings: parseInt(l.active_listings, 10),
      sold_listings: parseInt(l.sold_listings, 10),
      total_views: parseInt(l.total_views, 10),
      avg_rating: parseFloat(r.avg_rating),
      total_reviews: parseInt(r.total_reviews, 10),
      today_views: parseInt(tv.today_views, 10),
      today_contacts: parseInt(tc.today_contacts, 10),
      unread_messages: parseInt(um.unread_messages, 10),
      recent_activities: (activitiesRes.rows as Array<{ id: number; title: string; status: string; created_at: string }>).map((a) => ({
        id: a.id,
        description: `ثبت آگهی «${a.title}»`,
        status: a.status,
        created_at: a.created_at,
      })),
    };
  }

  async getSubscription(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT dp.*, u.role FROM dealer_profiles dp
       JOIN users u ON u.id = dp.user_id
       WHERE dp.user_id = $1`,
      [userId],
    );
    return rows[0] as (DealerProfileRow & { role: string }) | undefined;
  }

  async addReview(data: { dealer_id: string; user_id: string; rating: number; comment?: string }) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO dealer_reviews (dealer_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.dealer_id, data.user_id, data.rating, data.comment ?? ''],
    );
    return rows[0];
  }
}

export const dealerRepo = new DealerRepository();
