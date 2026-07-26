import { getDb } from '../../../config/database.js';
import { Favorite } from '../../entities/favorite/Favorite.entity.js';
import type { FavoriteRepository } from '../../entities/favorite/Favorite.repository.js';

export class FavoriteRepositoryImpl implements FavoriteRepository {
  async findByUser(userId: string): Promise<Favorite[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT f.*, l.id as listing_id
       FROM favorites f
       JOIN listings l ON l.id = f.listing_id
       WHERE f.user_id = $1 AND l.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      [userId],
    );
    return (rows as Record<string, unknown>[]).map(r => Favorite.fromSnapshot({
      userId: r.user_id as string,
      listingId: r.listing_id as number,
      favoritedAt: r.created_at as string,
    }));
  }

  async findByUserWithListing(userId: string): Promise<Record<string, unknown>[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT l.*, f.created_at as favorited_at
       FROM favorites f
       JOIN listings l ON l.id = f.listing_id
       WHERE f.user_id = $1 AND l.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      [userId],
    );
    return rows as Record<string, unknown>[];
  }

  async toggle(userId: string, listingId: number): Promise<{ favorited: boolean }> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO DELETE
       RETURNING user_id`,
      [userId, listingId],
    );
    return { favorited: rows.length === 1 };
  }
}
