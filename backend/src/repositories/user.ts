import { getDb } from '../config/database.js';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string | null;
  role: 'user' | 'dealer' | 'agency' | 'admin';
  status: string;
  avatar: string | null;
  city: string | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CreateUserData = {
  email: string;
  password_hash: string;
  name: string;
};

export type UpdateUserData = {
  name?: string;
  avatar?: string | null;
  phone?: string;
  role?: string;
  status?: string;
  email_verified_at?: string;
  phone_verified_at?: string;
  password_hash?: string;
};

export class UserRepository {
  async findByEmail(email: string): Promise<UserRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email],
    );
    return rows[0] as UserRow | undefined;
  }

  async findById(id: string): Promise<UserRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );
    return rows[0] as UserRow | undefined;
  }

  async create(data: CreateUserData): Promise<UserRow> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.password_hash, data.name],
    );
    return rows[0] as UserRow;
  }

  async update(id: string, data: UpdateUserData): Promise<UserRow | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values,
    );
    return rows[0] as UserRow | undefined;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const db = await getDb();
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, id],
    );
  }
}

export const userRepo = new UserRepository();
