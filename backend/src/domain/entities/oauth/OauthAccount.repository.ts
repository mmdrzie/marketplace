import { OauthAccount } from './OauthAccount.entity.js';

export interface OauthAccountRepository {
  /** Find an active (non-deleted) identity. */
  findByProviderAccount(provider: string, providerAccountId: string): Promise<OauthAccount | null>;
  /** Find ANY row (including soft-deleted) for restore/link purposes. */
  findAnyByProviderAccount(provider: string, providerAccountId: string): Promise<OauthAccount | null>;
  findByUserAndProvider(userId: string, provider: string): Promise<OauthAccount | null>;
  save(account: OauthAccount): Promise<void>;
}
