import { Hono } from 'hono';
import { getDb } from '../config/database.js';

const router = new Hono();

router.get('/public', async (c) => {
  const db = await getDb();
  try {
    const result = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM listings WHERE status = 'published' AND deleted_at IS NULL) as active_listings,
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM provinces) as total_provinces,
        (SELECT COALESCE((SELECT COUNT(*) FROM dealers WHERE status = 'approved'), 0)) as approved_dealers`,
      [],
    );
    const row = result.rows[0] as Record<string, string>;
    return c.json({
      success: true,
      data: {
        activeListings: parseInt(row.active_listings || '0', 10),
        totalUsers: parseInt(row.total_users || '0', 10),
        totalProvinces: parseInt(row.total_provinces || '0', 10),
        approvedDealers: parseInt(row.approved_dealers || '0', 10),
      },
    });
  } catch {
    return c.json({
      success: true,
      data: { activeListings: 0, totalUsers: 0, totalProvinces: 0, approvedDealers: 0 },
    });
  }
});

export { router as statsRouter };
