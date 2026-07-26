import { getDb } from '../../../config/database.js';
import type { AnalyticsProjectionRow, AnalyticsProjectionRepository } from './AnalyticsProjection.js';

export class AnalyticsProjectionRepositoryImpl implements AnalyticsProjectionRepository {
  async getDaily(date?: string): Promise<AnalyticsProjectionRow | null> {
    const db = await getDb();
    const targetDate = date ?? new Date().toISOString().slice(0, 10);
    const { rows } = await db.query('SELECT * FROM analytics_projection WHERE date = $1', [targetDate]);
    if (!rows.length) return null;
    return this.toRow(rows[0] as Record<string, unknown>);
  }

  async getRange(from: string, to: string): Promise<AnalyticsProjectionRow[]> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM analytics_projection WHERE date >= $1 AND date <= $2 ORDER BY date', [from, to],
    );
    return (rows as Record<string, unknown>[]).map(r => this.toRow(r));
  }

  async refresh(): Promise<void> {
    const db = await getDb();
    await db.query(`
      INSERT INTO analytics_projection (date, total_listings, active_listings, new_listings_today,
        total_users, total_dealers, total_views, total_conversations)
      SELECT
        CURRENT_DATE::text as date,
        (SELECT COUNT(*) FROM listings WHERE deleted_at IS NULL) as total_listings,
        (SELECT COUNT(*) FROM listings WHERE status = 'published' AND deleted_at IS NULL) as active_listings,
        (SELECT COUNT(*) FROM listings WHERE created_at >= CURRENT_DATE AND deleted_at IS NULL) as new_listings_today,
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM dealer_profiles WHERE is_active = true) as total_dealers,
        (SELECT COALESCE(SUM(views), 0) FROM listings WHERE deleted_at IS NULL) as total_views,
        (SELECT COUNT(*) FROM conversations) as total_conversations
      ON CONFLICT (date) DO UPDATE SET
        total_listings=EXCLUDED.total_listings, active_listings=EXCLUDED.active_listings,
        new_listings_today=EXCLUDED.new_listings_today, total_users=EXCLUDED.total_users,
        total_dealers=EXCLUDED.total_dealers, total_views=EXCLUDED.total_views,
        total_conversations=EXCLUDED.total_conversations
    `);
  }

  private toRow(r: Record<string, unknown>): AnalyticsProjectionRow {
    return {
      date: (r.date as Date).toISOString().slice(0, 10),
      totalListings: r.total_listings as number,
      activeListings: r.active_listings as number,
      newListingsToday: r.new_listings_today as number,
      totalUsers: r.total_users as number,
      totalDealers: r.total_dealers as number,
      totalViews: r.total_views as number,
      totalConversations: r.total_conversations as number,
    };
  }
}
