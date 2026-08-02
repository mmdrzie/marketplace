export interface OauthLoginLogEntry {
  userId?: string | null;
  email?: string | null;
  provider?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  success: boolean;
  failureReason?: string | null;
}

export interface OauthLoginLogRepository {
  create(entry: OauthLoginLogEntry): Promise<void>;
}
