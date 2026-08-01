import { getDb } from '../../config/database.js';
import { AppError } from '../../errors.js';

export type WorkshopType = 'mechanic' | 'tuner' | 'both';
export type WorkshopStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

interface WorkshopRow {
  user_id: string;
  workshop_name: string;
  workshop_slug: string;
  type: WorkshopType;
  specialty: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  services: string[];
  description: string;
  logo: string;
  cover_image: string;
  documents: string[];
  status: WorkshopStatus;
  admin_note: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

type DbRow = Record<string, unknown>;

export const WORKSHOP_TYPE_LABELS: Record<WorkshopType, string> = {
  mechanic: 'تعمیرکار',
  tuner: 'تیونر',
  both: 'تعمیرکار و تیونر',
};

const PUBLIC_COLUMNS = `w.user_id, w.workshop_name, w.workshop_slug, w.type, w.specialty,
  w.city, w.address, w.phone, w.hours, w.services, w.description, w.logo, w.cover_image,
  w.approved_at, w.created_at, u.name AS owner_name`;

export class WorkshopService {
  // --- Public ---

  async listPublic(filters?: {
    q?: string;
    type?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) {
    const db = await getDb();
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.min(50, Math.max(1, filters?.limit || 12));
    const conditions = ['w.status = $1'];
    const params: unknown[] = ['approved'];
    let idx = 2;

    if (filters?.q) {
      conditions.push(`(w.workshop_name ILIKE $${idx} OR w.specialty ILIKE $${idx} OR w.description ILIKE $${idx} OR u.name ILIKE $${idx})`);
      params.push(`%${filters.q}%`);
      idx++;
    }
    if (filters?.type && ['mechanic', 'tuner', 'both'].includes(filters.type)) {
      conditions.push(`w.type = $${idx++}`);
      params.push(filters.type);
    }
    if (filters?.city) {
      conditions.push(`w.city ILIKE $${idx++}`);
      params.push(filters.city);
    }

    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLUMNS}
       FROM workshop_profiles w JOIN users u ON u.id = w.user_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY w.updated_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, limit, (page - 1) * limit],
    );
    const count = await db.query(
      `SELECT COUNT(*)::int AS total FROM workshop_profiles w
       JOIN users u ON u.id = w.user_id WHERE ${conditions.join(' AND ')}`,
      params,
    );
    return {
      rows,
      total: (count.rows[0] as DbRow).total as number,
      page,
      limit,
    };
  }

  async listCities() {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT DISTINCT city FROM workshop_profiles
       WHERE status = 'approved' AND city <> ''
       ORDER BY city`,
    );
    return rows.map((r) => (r as DbRow).city as string);
  }

  async getPublicBySlug(slug: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT ${PUBLIC_COLUMNS}
       FROM workshop_profiles w JOIN users u ON u.id = w.user_id
       WHERE w.workshop_slug = $1 AND w.status = 'approved'`,
      [slug],
    );
    return rows[0] || null;
  }

  // --- Owner ---

  async getByUser(userId: string) {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM workshop_profiles WHERE user_id = $1', [userId]);
    return rows[0] || null;
  }

  async register(userId: string, data: {
    workshopName: string;
    workshopSlug: string;
    type: WorkshopType;
    specialty?: string;
    city?: string;
    address?: string;
    phone?: string;
    hours?: string;
    services?: string[];
    description?: string;
    documents?: string[];
  }) {
    const db = await getDb();
    if (!['mechanic', 'tuner', 'both'].includes(data.type)) {
      throw AppError.badRequest('نوع تعمیرکار معتبر نیست');
    }
    if (!/^[a-z0-9-]+$/.test(data.workshopSlug)) {
      throw AppError.badRequest('آدرس اینترنتی فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد');
    }
    let rows: Record<string, unknown>[] = [];
    try {
      const result = await db.query(
      `INSERT INTO workshop_profiles (
         user_id, workshop_name, workshop_slug, type, specialty, city, address,
         phone, hours, services, description, documents
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (user_id) DO UPDATE SET
         workshop_name = EXCLUDED.workshop_name,
         workshop_slug = EXCLUDED.workshop_slug,
         type = EXCLUDED.type,
         specialty = EXCLUDED.specialty,
         city = EXCLUDED.city,
         address = EXCLUDED.address,
         phone = EXCLUDED.phone,
         hours = EXCLUDED.hours,
         services = EXCLUDED.services,
         description = EXCLUDED.description,
         documents = EXCLUDED.documents,
         status = 'pending',
         admin_note = '',
         updated_at = NOW()
       RETURNING *`,
      [userId, data.workshopName, data.workshopSlug, data.type, data.specialty || '',
       data.city || '', data.address || '', data.phone || '', data.hours || '',
       data.services || [], data.description || '', data.documents || []],
    );
      rows = result.rows as Record<string, unknown>[];
    } catch (err) {
      const pgErr = err as { code?: string };
      if (pgErr.code === '23505') {
        throw AppError.resourceConflict('این آدرس اینترنتی (slug) قبلاً استفاده شده است');
      }
      throw err;
    }
    return rows[0];
  }

  async update(userId: string, data: Record<string, unknown>) {
    const db = await getDb();
    const allowed = new Set([
      'workshop_name', 'workshop_slug', 'type', 'specialty', 'city', 'address',
      'phone', 'hours', 'services', 'description', 'logo', 'cover_image',
    ]);
    if (data.workshop_slug !== undefined && !/^[a-z0-9-]+$/.test(String(data.workshop_slug))) {
      throw AppError.badRequest('آدرس اینترنتی فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد');
    }
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (!allowed.has(key) || value === undefined) continue;
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
    if (!fields.length) return this.getByUser(userId);

    const existing = await this.getByUser(userId);
    if (!existing) throw AppError.notFound('پروفایل تعمیرکار یافت نشد');
    const currentStatus = (existing as DbRow).status as string;
    const resubmitting = currentStatus === 'rejected' || currentStatus === 'suspended';
    if (resubmitting) {
      fields.push(`status = $${idx++}`, `admin_note = $${idx++}`);
      values.push('pending', '');
    }
    values.push(userId);
    try {
      const { rows } = await db.query(
        `UPDATE workshop_profiles SET ${fields.join(', ')}, updated_at = NOW()
         WHERE user_id = $${idx} RETURNING *`,
        values,
      );
      return rows[0] || null;
    } catch (err) {
      const pgErr = err as { code?: string };
      if (pgErr.code === '23505') {
        throw AppError.resourceConflict('این آدرس اینترنتی (slug) قبلاً استفاده شده است');
      }
      throw err;
    }
  }

  // --- Admin ---

  async adminList(status?: string) {
    const db = await getDb();
    if (status && ['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      const { rows } = await db.query(
        `SELECT w.*, u.name AS owner_name, u.email AS owner_email
         FROM workshop_profiles w JOIN users u ON u.id = w.user_id
         WHERE w.status = $1 ORDER BY w.created_at DESC`,
        [status],
      );
      return rows;
    }
    const { rows } = await db.query(
      `SELECT w.*, u.name AS owner_name, u.email AS owner_email
       FROM workshop_profiles w JOIN users u ON u.id = w.user_id
       ORDER BY w.created_at DESC`,
    );
    return rows;
  }

  async adminApprove(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE workshop_profiles SET status = 'approved', approved_at = NOW(), updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      [userId],
    );
    if (!rows[0]) throw AppError.notFound('پروفایل تعمیرکار یافت نشد');
    return rows[0];
  }

  async adminReject(userId: string, note: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE workshop_profiles SET status = 'rejected', admin_note = $2, updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      [userId, note],
    );
    if (!rows[0]) throw AppError.notFound('پروفایل تعمیرکار یافت نشد');
    return rows[0];
  }

  async adminSuspend(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE workshop_profiles SET status = 'suspended', updated_at = NOW()
       WHERE user_id = $1 RETURNING *`,
      [userId],
    );
    if (!rows[0]) throw AppError.notFound('پروفایل تعمیرکار یافت نشد');
    return rows[0];
  }

  async adminUpdate(userId: string, data: Record<string, unknown>) {
    const db = await getDb();
    const allowed = new Set([
      'workshop_name', 'workshop_slug', 'type', 'specialty', 'city', 'address',
      'phone', 'hours', 'services', 'description', 'logo', 'cover_image',
      'status', 'admin_note',
    ]);
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (!allowed.has(key) || value === undefined) continue;
      fields.push(`${key} = $${idx++}`);
      values.push(value);
    }
    if (!fields.length) throw AppError.badRequest('فیلدی برای ویرایش ارسال نشده است');
    values.push(userId);
    const { rows } = await db.query(
      `UPDATE workshop_profiles SET ${fields.join(', ')}, updated_at = NOW()
       WHERE user_id = $${idx} RETURNING *`,
      values,
    );
    if (!rows[0]) throw AppError.notFound('پروفایل تعمیرکار یافت نشد');
    return rows[0];
  }

  async adminDelete(userId: string) {
    const db = await getDb();
    const { rowCount } = await db.query(
      'DELETE FROM workshop_profiles WHERE user_id = $1',
      [userId],
    );
    if (!rowCount) throw AppError.notFound('پروفایل تعمیرکار یافت نشد');
  }
}

export const workshopService = new WorkshopService();
