import { NotificationPreferences } from './NotificationPreferences.entity.js';

export interface NotificationPreferencesRepository {
  get(userId: string): Promise<NotificationPreferences>;
  upsert(userId: string, data: { email_enabled?: boolean; sms_enabled?: boolean; push_enabled?: boolean; marketing_enabled?: boolean }): Promise<NotificationPreferences>;
}
