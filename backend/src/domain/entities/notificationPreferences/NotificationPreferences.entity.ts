export interface NotificationPreferencesSnapshot {
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  marketingEnabled: boolean;
  updatedAt: string;
}

export class NotificationPreferences {
  private constructor(
    public readonly userId: string,
    public emailEnabled: boolean,
    public smsEnabled: boolean,
    public pushEnabled: boolean,
    public marketingEnabled: boolean,
    public readonly updatedAt: Date,
  ) {}

  static create(userId: string): NotificationPreferences {
    return new NotificationPreferences(userId, true, true, true, false, new Date());
  }

  static fromSnapshot(s: NotificationPreferencesSnapshot): NotificationPreferences {
    return new NotificationPreferences(s.userId, s.emailEnabled, s.smsEnabled, s.pushEnabled, s.marketingEnabled, new Date(s.updatedAt));
  }

  snapshot(): NotificationPreferencesSnapshot {
    return { userId: this.userId, emailEnabled: this.emailEnabled, smsEnabled: this.smsEnabled, pushEnabled: this.pushEnabled, marketingEnabled: this.marketingEnabled, updatedAt: this.updatedAt.toISOString() };
  }

  update(data: { email_enabled?: boolean; sms_enabled?: boolean; push_enabled?: boolean; marketing_enabled?: boolean }): void {
    if (data.email_enabled !== undefined) this.emailEnabled = data.email_enabled;
    if (data.sms_enabled !== undefined) this.smsEnabled = data.sms_enabled;
    if (data.push_enabled !== undefined) this.pushEnabled = data.push_enabled;
    if (data.marketing_enabled !== undefined) this.marketingEnabled = data.marketing_enabled;
  }
}
