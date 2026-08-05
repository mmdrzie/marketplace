import { RefreshToken } from './RefreshToken.entity.js';

export interface RefreshTokenRepository {
  create(data: {
    user_id: string;
    token_hash: string;
    expires_at: Date;
    last_ip?: string | null;
    last_user_agent?: string | null;
  }): Promise<RefreshToken>;
  findByTokenHash(hash: string): Promise<RefreshToken | null>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
