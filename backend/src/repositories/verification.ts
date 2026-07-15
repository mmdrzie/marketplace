import { getDb } from '../config/database.js';

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
  // Email

  async findLatestEmailVerification(userId: string): Promise<EmailVerificationRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM email_verifications WHERE user_id = $1 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [userId],
    );
    return rows[0] as EmailVerificationRow | undefined;
  }

  async createEmailVerification(data: { user_id: string; token_hash: string; expires_at: Date }): Promise<EmailVerificationRow> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3) RETURNING *`,
      [data.user_id, data.token_hash, data.expires_at],
    );
    return rows[0] as EmailVerificationRow;
  }

  async findEmailVerificationByHash(hash: string): Promise<EmailVerificationRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM email_verifications WHERE token_hash = $1 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [hash],
    );
    return rows[0] as EmailVerificationRow | undefined;
  }

  async markEmailVerified(id: string): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE email_verifications SET verified_at = NOW() WHERE id = $1', [id]);
  }

  // Phone

  async createPhoneVerification(data: { user_id: string; phone: string; otp_hash: string; expires_at: Date }): Promise<PhoneVerificationRow> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO phone_verifications (user_id, phone, otp_hash, expires_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.user_id, data.phone, data.otp_hash, data.expires_at],
    );
    return rows[0] as PhoneVerificationRow;
  }

  async findLatestPhoneVerification(userId: string, phone: string): Promise<PhoneVerificationRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM phone_verifications WHERE user_id = $1 AND phone = $2 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [userId, phone],
    );
    return rows[0] as PhoneVerificationRow | undefined;
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
}

export const verificationRepo = new VerificationRepository();
