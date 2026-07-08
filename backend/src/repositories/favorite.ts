import { getDb } from '../config/database';

export class FavoriteRepository {
  async findByUser(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT l.*, f.created_at as favorited_at
       FROM favorites f
       JOIN listings l ON l.id = f.listing_id
       WHERE f.user_id = $1 AND l.deleted_at IS NULL
       ORDER BY f.created_at DESC`,
      [userId],
    );
    return rows;
  }

  async toggle(userId: string, listingId: number): Promise<{ favorited: boolean }> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT id FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId],
    );

    if ((rows[0] as { id: number } | undefined)) {
      await db.query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [userId, listingId]);
      return { favorited: false };
    }

    await db.query(
      'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, listingId],
    );
    return { favorited: true };
  }
}

export const favoriteRepo = new FavoriteRepository();
