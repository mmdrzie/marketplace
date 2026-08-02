import { getDb } from '../../../config/database.js';
import { User } from '../../entities/user/User.entity.js';
import type { UserRepository } from '../../entities/user/User.repository.js';

export class UserRepositoryImpl implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (!rows.length) return null;
    return User.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
    if (!rows.length) return null;
    return User.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findByPhone(phone: string): Promise<User | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL', [phone]);
    if (!rows.length) return null;
    return User.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async save(user: User): Promise<void> {
    const db = await getDb();
    const s = user.snapshot();
    const existing = await this.findById(s.id);

    if (!existing) {
      await db.query(
        `INSERT INTO users (id, email, name, phone, role, status, avatar, public_id, password_hash, city, email_verified_at, phone_verified_at, has_password)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.email, s.name, s.phone, s.role, s.status, s.avatar, s.publicId, s.passwordHash, s.city, s.emailVerified ? new Date().toISOString() : null, s.phoneVerified ? new Date().toISOString() : null, s.hasPassword],
      );
    } else {
      await db.query(
        `UPDATE users SET name=$1, phone=$2, role=$3, status=$4, avatar=$5,
         password_hash=$6, city=$7, email_verified_at=$8, phone_verified_at=$9, has_password=$10, updated_at=NOW()
         WHERE id=$11`,
        [s.name, s.phone, s.role, s.status, s.avatar, s.passwordHash, s.city, s.emailVerified ? new Date().toISOString() : null, s.phoneVerified ? new Date().toISOString() : null, s.hasPassword, s.id],
      );
    }
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const db = await getDb();
    await db.query(
      'UPDATE users SET password_hash = $1, has_password = true, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL',
      [passwordHash, id],
    );
  }

  private toSnapshot(row: Record<string, unknown>) {
    return {
      id: row.id as string, email: row.email as string,
      name: row.name as string | null, phone: row.phone as string | null,
      role: row.role as 'user' | 'dealer' | 'agency' | 'store' | 'admin',
      status: row.status as 'active' | 'banned' | 'suspended',
      avatar: row.avatar as string | null, publicId: row.public_id as string | null,
      passwordHash: row.password_hash as string | null, city: row.city as string | null,
      emailVerified: row.email_verified_at != null, phoneVerified: row.phone_verified_at != null,
      hasPassword: row.has_password === undefined ? true : row.has_password as boolean,
      createdAt: row.created_at as string, updatedAt: row.updated_at as string,
      deletedAt: row.deleted_at as string | null,
    };
  }
}
