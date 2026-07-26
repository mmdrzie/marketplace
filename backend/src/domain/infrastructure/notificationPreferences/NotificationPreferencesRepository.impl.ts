import { getDb } from '../../../config/database.js';
import { NotificationPreferences } from '../../entities/notificationPreferences/NotificationPreferences.entity.js';
import type { NotificationPreferencesRepository } from '../../entities/notificationPreferences/NotificationPreferences.repository.js';

export class NotificationPreferencesRepositoryImpl implements NotificationPreferencesRepository {
  private memoryStore = new Map<string, NotificationPreferences>();

  async get(userId: string): Promise<NotificationPreferences> {
    try {
      const db = await getDb();
      const { rows } = await db.query('SELECT * FROM notification_preferences WHERE user_id = $1', [userId]);
      if (rows[0]) {
        const r = rows[0] as Record<string, unknown>;
        return NotificationPreferences.fromSnapshot({
          userId: r.user_id as string,
          emailEnabled: r.email_enabled as boolean,
          smsEnabled: r.sms_enabled as boolean,
          pushEnabled: r.push_enabled as boolean,
          marketingEnabled: r.marketing_enabled as boolean,
          updatedAt: r.updated_at as string,
        });
      }
    } catch {
      const cached = this.memoryStore.get(userId);
      if (cached) return cached;
    }
    return NotificationPreferences.create(userId);
  }

  async upsert(userId: string, data: { email_enabled?: boolean; sms_enabled?: boolean; push_enabled?: boolean; marketing_enabled?: boolean }): Promise<NotificationPreferences> {
    const current = await this.get(userId);
    current.update(data);

    try {
      const db = await getDb();
      const s = current.snapshot();
      await db.query(
        `INSERT INTO notification_preferences (user_id, email_enabled, sms_enabled, push_enabled, marketing_enabled, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           email_enabled = EXCLUDED.email_enabled,
           sms_enabled = EXCLUDED.sms_enabled,
           push_enabled = EXCLUDED.push_enabled,
           marketing_enabled = EXCLUDED.marketing_enabled,
           updated_at = NOW()`,
        [s.userId, s.emailEnabled, s.smsEnabled, s.pushEnabled, s.marketingEnabled],
      );
    } catch {
      this.memoryStore.set(userId, current);
    }
    return current;
  }
}
