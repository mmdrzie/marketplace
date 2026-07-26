import type { Context } from 'hono';
import { NotificationPreferencesRepositoryImpl } from '../../infrastructure/notificationPreferences/NotificationPreferencesRepository.impl.js';

export class NotificationPreferencesController {
  constructor(private readonly repo: NotificationPreferencesRepositoryImpl) {}

  async get(c: Context): Promise<Response> {
    const user = c.get('user');
    const prefs = await this.repo.get(user.id);
    return c.json({ data: prefs.snapshot() });
  }

  async update(c: Context): Promise<Response> {
    const user = c.get('user');
    const body = await c.req.json();
    const prefs = await this.repo.upsert(user.id, {
      email_enabled: body.email_enabled,
      sms_enabled: body.sms_enabled,
      push_enabled: body.push_enabled,
      marketing_enabled: body.marketing_enabled,
    });
    return c.json({ data: prefs.snapshot() });
  }
}
