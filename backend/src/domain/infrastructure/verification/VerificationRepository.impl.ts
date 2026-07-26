import { getDb } from '../../../config/database.js';
import { EmailVerification } from '../../entities/verification/EmailVerification.entity.js';
import { PhoneVerification } from '../../entities/verification/PhoneVerification.entity.js';
import { RegistrationOtp } from '../../entities/verification/RegistrationOtp.entity.js';
import type { VerificationRepository } from '../../entities/verification/Verification.repository.js';

export class VerificationRepositoryImpl implements VerificationRepository {
  async findLatestEmailVerification(userId: string): Promise<EmailVerification | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM email_verifications WHERE user_id = $1 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [userId],
    );
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return EmailVerification.fromSnapshot({
      id: r.id as string,
      userId: r.user_id as string,
      tokenHash: r.token_hash as string,
      expiresAt: r.expires_at as string,
      verifiedAt: r.verified_at as string | null,
      createdAt: r.created_at as string,
    });
  }

  async createEmailVerification(data: { user_id: string; token_hash: string; expires_at: Date }): Promise<EmailVerification> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *`,
      [data.user_id, data.token_hash, data.expires_at],
    );
    const r = rows[0] as Record<string, unknown>;
    return EmailVerification.fromSnapshot({
      id: r.id as string,
      userId: r.user_id as string,
      tokenHash: r.token_hash as string,
      expiresAt: r.expires_at as string,
      verifiedAt: r.verified_at as string | null,
      createdAt: r.created_at as string,
    });
  }

  async findEmailVerificationByHash(hash: string): Promise<EmailVerification | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM email_verifications WHERE token_hash = $1 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [hash],
    );
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return EmailVerification.fromSnapshot({
      id: r.id as string,
      userId: r.user_id as string,
      tokenHash: r.token_hash as string,
      expiresAt: r.expires_at as string,
      verifiedAt: r.verified_at as string | null,
      createdAt: r.created_at as string,
    });
  }

  async markEmailVerified(id: string): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE email_verifications SET verified_at = NOW() WHERE id = $1', [id]);
  }

  async createPhoneVerification(data: { user_id: string; phone: string; otp_hash: string; expires_at: Date }): Promise<PhoneVerification> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO phone_verifications (user_id, phone, otp_hash, expires_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.user_id, data.phone, data.otp_hash, data.expires_at],
    );
    const r = rows[0] as Record<string, unknown>;
    return PhoneVerification.fromSnapshot({
      id: r.id as string,
      userId: r.user_id as string,
      phone: r.phone as string,
      otpHash: r.otp_hash as string,
      expiresAt: r.expires_at as string,
      verifiedAt: r.verified_at as string | null,
      createdAt: r.created_at as string,
    });
  }

  async findLatestPhoneVerification(userId: string, phone: string): Promise<PhoneVerification | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM phone_verifications WHERE user_id = $1 AND phone = $2 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [userId, phone],
    );
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return PhoneVerification.fromSnapshot({
      id: r.id as string,
      userId: r.user_id as string,
      phone: r.phone as string,
      otpHash: r.otp_hash as string,
      expiresAt: r.expires_at as string,
      verifiedAt: r.verified_at as string | null,
      createdAt: r.created_at as string,
    });
  }

  async markPhoneVerified(id: string): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE phone_verifications SET verified_at = NOW() WHERE id = $1', [id]);
  }

  async countRecentByPhone(phone: string, withinSeconds: number): Promise<number> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM phone_verifications WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 second' * $2`,
      [phone, withinSeconds],
    );
    const row = rows[0] as { count: string };
    return parseInt(row.count, 10);
  }

  async countRecentByUser(userId: string, withinSeconds: number): Promise<number> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM phone_verifications WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 second' * $2`,
      [userId, withinSeconds],
    );
    const row = rows[0] as { count: string };
    return parseInt(row.count, 10);
  }

  async createRegistrationOtp(data: { identifier: string; type: 'email' | 'phone'; otp_hash: string; expires_at: Date }): Promise<RegistrationOtp> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO registration_otps (identifier, type, otp_hash, expires_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.identifier, data.type, data.otp_hash, data.expires_at],
    );
    const r = rows[0] as Record<string, unknown>;
    return RegistrationOtp.fromSnapshot({
      id: r.id as string,
      identifier: r.identifier as string,
      type: r.type as 'email' | 'phone',
      otpHash: r.otp_hash as string,
      expiresAt: r.expires_at as string,
      verifiedAt: r.verified_at as string | null,
      createdAt: r.created_at as string,
    });
  }

  async findLatestRegistrationOtp(identifier: string, type: 'email' | 'phone'): Promise<RegistrationOtp | null> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM registration_otps WHERE identifier = $1 AND type = $2 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [identifier, type],
    );
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return RegistrationOtp.fromSnapshot({
      id: r.id as string,
      identifier: r.identifier as string,
      type: r.type as 'email' | 'phone',
      otpHash: r.otp_hash as string,
      expiresAt: r.expires_at as string,
      verifiedAt: r.verified_at as string | null,
      createdAt: r.created_at as string,
    });
  }

  async markRegistrationOtpVerified(id: string): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE registration_otps SET verified_at = NOW() WHERE id = $1', [id]);
  }

  async countRecentRegistrationOtps(identifier: string, type: 'email' | 'phone', withinSeconds: number): Promise<number> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT COUNT(*) as count FROM registration_otps WHERE identifier = $1 AND type = $2 AND created_at > NOW() - INTERVAL '1 second' * $3`,
      [identifier, type, withinSeconds],
    );
    const row = rows[0] as { count: string };
    return parseInt(row.count, 10);
  }
}
