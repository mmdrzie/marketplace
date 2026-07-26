import type { Context } from 'hono';
import { userRepo } from '../../../repositories/user.js';
import { AppError } from '../../../errors.js';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

export class AdminController {
  async listUsers(c: Context): Promise<Response> {
    const db = (await import('../../../config/database.js')).getDb;
    const d = await db();
    const { rows } = await d.query('SELECT id, email, name, role, status, phone, city, email_verified, phone_verified, created_at, updated_at FROM users ORDER BY created_at DESC');
    return c.json({ success: true, data: rows });
  }

  async createUser(c: Context): Promise<Response> {
    const { email, password, name, role, phone } = await c.req.json();
    const existing = await userRepo.findByEmail(email);
    if (existing) throw AppError.resourceConflict('Email already exists');
    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const data = {
      id, email, password_hash: passwordHash, name,
      phone: phone ?? null, role: role ?? 'user', city: null,
    };
    const created = await userRepo.create(data);
    return c.json({ success: true, data: created }, 201);
  }

  async updateUser(c: Context): Promise<Response> {
    const id = c.req.param('id');
    if (!id) throw AppError.notFound('User not found');
    const data = await c.req.json();
    const user = await userRepo.findById(id);
    if (!user) throw AppError.notFound('User not found');
    const db = (await import('../../../config/database.js')).getDb;
    const d = await db();
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (fields.length === 0) return c.json({ success: true, data: user });
    values.push(id);
    const { rows } = await d.query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, email, name, role, status, phone, city, email_verified, phone_verified, created_at, updated_at`, values);
    return c.json({ success: true, data: rows[0] });
  }

  async updateUserRole(c: Context): Promise<Response> {
    const id = c.req.param('id');
    if (!id) throw AppError.notFound('User not found');
    const { role } = await c.req.json();
    const user = await userRepo.findById(id);
    if (!user) throw AppError.notFound('User not found');
    const db = (await import('../../../config/database.js')).getDb;
    const d = await db();
    const { rows } = await d.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, status, phone, city, email_verified, phone_verified, created_at, updated_at', [role, id]);
    return c.json({ success: true, data: rows[0] });
  }
}
