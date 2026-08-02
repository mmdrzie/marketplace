import { getDb } from '../../../config/database.js';
import { OauthAccount } from '../../entities/oauth/OauthAccount.entity.js';
import type { OauthAccountRepository } from '../../entities/oauth/OauthAccount.repository.js';

export class OauthAccountRepositoryImpl implements OauthAccountRepository {
  async findByProviderAccount(provider: string, providerAccountId: string): Promise<OauthAccount | null> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM oauth_accounts WHERE provider = $1 AND provider_account_id = $2 AND deleted_at IS NULL`,
      [provider, providerAccountId],
    );
    if (!rows.length) return null;
    return OauthAccount.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findAnyByProviderAccount(provider: string, providerAccountId: string): Promise<OauthAccount | null> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM oauth_accounts WHERE provider = $1 AND provider_account_id = $2`,
      [provider, providerAccountId],
    );
    if (!rows.length) return null;
    return OauthAccount.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByUserAndProvider(userId: string, provider: string): Promise<OauthAccount | null> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM oauth_accounts WHERE user_id = $1 AND provider = $2`,
      [userId, provider],
    );
    if (!rows.length) return null;
    return OauthAccount.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async save(account: OauthAccount): Promise<void> {
    const db = await getDb();
    const s = account.snapshot();
    await db.query(
      `INSERT INTO oauth_accounts
         (id, user_id, provider, provider_account_id, provider_user_name, provider_avatar, email,
          created_at, updated_at, last_login_at, deleted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE SET
         provider_user_name = EXCLUDED.provider_user_name,
         provider_avatar = EXCLUDED.provider_avatar,
         email = EXCLUDED.email,
         updated_at = EXCLUDED.updated_at,
         last_login_at = EXCLUDED.last_login_at,
         deleted_at = EXCLUDED.deleted_at`,
      [s.id, s.userId, s.provider, s.providerAccountId, s.providerUserName, s.providerAvatar, s.email,
        s.createdAt, s.updatedAt, s.lastLoginAt, s.deletedAt],
    );
  }

  private toSnapshot(row: Record<string, unknown>) {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      provider: row.provider as 'google' | 'apple' | 'github' | 'microsoft',
      providerAccountId: row.provider_account_id as string,
      providerUserName: row.provider_user_name as string | null,
      providerAvatar: row.provider_avatar as string | null,
      email: row.email as string | null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
      lastLoginAt: row.last_login_at as string | null,
      deletedAt: row.deleted_at as string | null,
    };
  }
}
