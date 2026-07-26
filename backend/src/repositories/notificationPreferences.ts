import { getDb } from '../config/database.js';
import { NotificationPreferencesRepositoryImpl } from '../domain/infrastructure/notificationPreferences/NotificationPreferencesRepository.impl.js';

export interface NotificationPreferencesRow {
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  marketing_enabled: boolean;
  updated_at: string;
}

export type NotificationPreferencesInput = {
  email_enabled?: boolean;
  sms_enabled?: boolean;
  push_enabled?: boolean;
  marketing_enabled?: boolean;
};

export class NotificationPreferencesRepository {
  private _domainImpl: NotificationPreferencesRepositoryImpl;

  constructor(domainImpl?: NotificationPreferencesRepositoryImpl) {
    this._domainImpl = domainImpl ?? new NotificationPreferencesRepositoryImpl();
  }

  async get(userId: string): Promise<NotificationPreferencesRow> {
    const result = await this._domainImpl.get(userId);
    const s = result.snapshot();
    return { user_id: s.userId, email_enabled: s.emailEnabled, sms_enabled: s.smsEnabled, push_enabled: s.pushEnabled, marketing_enabled: s.marketingEnabled, updated_at: s.updatedAt };
  }

  async upsert(userId: string, data: NotificationPreferencesInput): Promise<NotificationPreferencesRow> {
    const result = await this._domainImpl.upsert(userId, data);
    const s = result.snapshot();
    return { user_id: s.userId, email_enabled: s.emailEnabled, sms_enabled: s.smsEnabled, push_enabled: s.pushEnabled, marketing_enabled: s.marketingEnabled, updated_at: s.updatedAt };
  }
}

export const notificationPreferencesRepo = new NotificationPreferencesRepository();
