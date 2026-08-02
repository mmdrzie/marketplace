import { getDb } from '../../../config/database.js';
import type { OauthLoginLogEntry, OauthLoginLogRepository } from '../../entities/oauth/OauthLoginLog.repository.js';

export class OauthLoginLogRepositoryImpl implements OauthLoginLogRepository {
  async create(entry: OauthLoginLogEntry): Promise<void> {
    const db = await getDb();
    await db.query(
      `INSERT INTO oauth_login_logs (user_id, email, provider, ip, user_agent, success, failure_reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [entry.userId ?? null, entry.email ?? null, entry.provider ?? null,
        entry.ip ?? null, entry.userAgent ?? null, entry.success, entry.failureReason ?? null],
    );
  }
}
