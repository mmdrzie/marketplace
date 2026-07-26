import { getDb } from '../config/database.js';
import type { UserRole } from '../domain/entities/user/User.entity.js';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string | null;
  role: UserRole;
  status: 'active' | 'banned' | 'suspended';
  avatar: string | null;
  city: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export async function createUser(data: {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone?: string | null;
  role?: UserRole;
  city?: string | null;
}): Promise<UserRow> {
  const db = await getDb();
  const { rows } = await db.query(
    `INSERT INTO users (id, email, password_hash, name, phone, role, city)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [data.id, data.email, data.password_hash, data.name, data.phone ?? null, data.role ?? 'user', data.city ?? null],
  );
  return rows[0] as UserRow;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getDb();
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL', [email]);
  return rows.length ? (rows[0] as UserRow) : null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const db = await getDb();
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [id]);
  return rows.length ? (rows[0] as UserRow) : null;
}
