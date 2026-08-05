import { Hono } from 'hono';
import { getDb } from '../config/database.js';

// Suggested client/edge cache TTL (seconds) — AUTH_API.md §3.
const CACHE_FOR_SEC = 60;
// «کاربران آنلاین» proxy: users whose refresh token was used in the last N minutes.
const ACTIVE_WINDOW_MINUTES = 10;

const router = new Hono();

router.get('/public', async (c) => {
  const db = await getDb();
  const empty = { activeListings: 0, totalUsers: 0, totalProvinces: 0, approvedDealers: 0, activeUsers: 0 };
  try {
    const result = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM listings WHERE status = 'published' AND deleted_at IS NULL) as active_listings,
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM provinces) as total_provinces,
        (SELECT COALESCE((SELECT COUNT(*) FROM dealer_profiles WHERE status = 'approved'), 0)) as approved_dealers,
        (SELECT COUNT(*) FROM refresh_tokens
           WHERE revoked_at IS NULL AND last_used_at > NOW() - ($1 || ' minutes')::interval) as active_users`,
      [String(ACTIVE_WINDOW_MINUTES)],
    );
    const row = result.rows[0] as Record<string, string>;
    return c.json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        cacheFor: CACHE_FOR_SEC,
        counters: {
          activeListings: parseInt(row.active_listings || '0', 10),
          totalUsers: parseInt(row.total_users || '0', 10),
          totalProvinces: parseInt(row.total_provinces || '0', 10),
          approvedDealers: parseInt(row.approved_dealers || '0', 10),
          activeUsers: parseInt(row.active_users || '0', 10),
        },
        latest: {},
      },
    });
  } catch (err) {
    console.error('[stats] counters query failed:', err);
    return c.json({
      success: true,
      data: { generatedAt: new Date().toISOString(), cacheFor: CACHE_FOR_SEC, counters: empty, latest: {} },
    });
  }
});

export { router as statsRouter };
