import { getDb } from '../config/database.js';
import { VerificationRepositoryImpl } from '../domain/infrastructure/verification/VerificationRepository.impl.js';

export interface EmailVerificationRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
}

export interface PhoneVerificationRow {
  id: string;
  user_id: string;
  phone: string;
  otp_hash: string;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
}

export class VerificationRepository {
  private _domainImpl: VerificationRepositoryImpl;

  constructor(domainImpl?: VerificationRepositoryImpl) {
    this._domainImpl = domainImpl ?? new VerificationRepositoryImpl();
  }

  async findLatestEmailVerification(userId: string): Promise<EmailVerificationRow | undefined> {
    const result = await this._domainImpl.findLatestEmailVerification(userId);
    if (!result) return undefined;
    const s = result.snapshot();
    return {
      id: s.id, user_id: s.userId, token_hash: s.tokenHash,
      expires_at: s.expiresAt, verified_at: s.verifiedAt, created_at: s.createdAt,
    };
  }

  async createEmailVerification(data: { user_id: string; token_hash: string; expires_at: Date }): Promise<EmailVerificationRow> {
    const result = await this._domainImpl.createEmailVerification(data);
    const s = result.snapshot();
    return {
      id: s.id, user_id: s.userId, token_hash: s.tokenHash,
      expires_at: s.expiresAt, verified_at: s.verifiedAt, created_at: s.createdAt,
    };
  }

  async findEmailVerificationByHash(hash: string): Promise<EmailVerificationRow | undefined> {
    const result = await this._domainImpl.findEmailVerificationByHash(hash);
    if (!result) return undefined;
    const s = result.snapshot();
    return {
      id: s.id, user_id: s.userId, token_hash: s.tokenHash,
      expires_at: s.expiresAt, verified_at: s.verifiedAt, created_at: s.createdAt,
    };
  }

  async markEmailVerified(id: string): Promise<void> {
    await this._domainImpl.markEmailVerified(id);
  }

  async createPhoneVerification(data: { user_id: string; phone: string; otp_hash: string; expires_at: Date }): Promise<PhoneVerificationRow> {
    const result = await this._domainImpl.createPhoneVerification(data);
    const s = result.snapshot();
    return {
      id: s.id, user_id: s.userId, phone: s.phone,
      otp_hash: s.otpHash, expires_at: s.expiresAt,
      verified_at: s.verifiedAt, created_at: s.createdAt,
    };
  }

  async findLatestPhoneVerification(userId: string, phone: string): Promise<PhoneVerificationRow | undefined> {
    const result = await this._domainImpl.findLatestPhoneVerification(userId, phone);
    if (!result) return undefined;
    const s = result.snapshot();
    return {
      id: s.id, user_id: s.userId, phone: s.phone,
      otp_hash: s.otpHash, expires_at: s.expiresAt,
      verified_at: s.verifiedAt, created_at: s.createdAt,
    };
  }

  async markPhoneVerified(id: string): Promise<void> {
    await this._domainImpl.markPhoneVerified(id);
  }

  async countRecentByPhone(phone: string, withinSeconds: number): Promise<number> {
    return this._domainImpl.countRecentByPhone(phone, withinSeconds);
  }

  async countRecentByUser(userId: string, withinSeconds: number): Promise<number> {
    return this._domainImpl.countRecentByUser(userId, withinSeconds);
  }
}

export const verificationRepo = new VerificationRepository();
