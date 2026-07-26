import { getDb } from '../../../config/database.js';
import { Notification, NotificationSnapshot } from '../../entities/notification/Notification.entity.js';
import type { NotificationRepository } from '../../entities/notification/Notification.repository.js';

function toInt(v: unknown): number {
  return typeof v === 'string' ? parseInt(v, 10) : v as number;
}

function rowToNotificationSnapshot(row: Record<string, unknown>): NotificationSnapshot {
  return {
    id: toInt(row.id),
    userId: row.user_id as string,
    type: row.type as string,
    title: row.title as string,
    body: row.body as string,
    data: typeof row.data === 'string'
      ? JSON.parse(row.data as string)
      : (row.data as Record<string, unknown>) ?? {},
    isRead: row.is_read as boolean,
    readAt: row.read_at as string | null,
    createdAt: row.created_at as string,
  };
}

export class NotificationRepositoryImpl implements NotificationRepository {
  async save(notification: Notification): Promise<void> {
    const db = await getDb();
    const s = notification.snapshot();
    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO notifications (user_id, type, title, body, data, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
        [s.userId, s.type, s.title, s.body, JSON.stringify(s.data)],
      );
      (notification as any).id = toInt((rows[0] as Record<string, unknown>).id);
    } else {
      await db.query(
        `UPDATE notifications SET is_read = $1, read_at = $2 WHERE id = $3`,
        [s.isRead, s.readAt, s.id],
      );
    }
  }

  async findById(id: number): Promise<Notification | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM notifications WHERE id = $1',
      [id],
    );
    if (!rows.length) return null;
    return Notification.fromSnapshot(rowToNotificationSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByUser(userId: string, limit = 50, offset = 0): Promise<Notification[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return (rows as Record<string, unknown>[]).map(r => Notification.fromSnapshot(rowToNotificationSnapshot(r)));
  }

  async markRead(id: number, userId: string): Promise<void> {
    const db = await getDb();
    await db.query(
      `UPDATE notifications SET is_read = true, read_at = NOW()
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
  }

  async markAllRead(userId: string): Promise<void> {
    const db = await getDb();
    await db.query(
      `UPDATE notifications SET is_read = true, read_at = NOW()
       WHERE user_id = $1 AND is_read = false`,
      [userId],
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [userId],
    );
    return parseInt((rows[0] as { count: string }).count, 10);
  }
}
