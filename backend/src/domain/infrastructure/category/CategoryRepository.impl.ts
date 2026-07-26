import { getDb } from '../../../config/database.js';
import { Category } from '../../entities/category/Category.entity.js';
import type { CategoryRepository } from '../../entities/category/Category.repository.js';

export class CategoryRepositoryImpl implements CategoryRepository {
  async findAll(): Promise<Category[]> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM categories ORDER BY sort_order, name');
    return (rows as Record<string, unknown>[]).map(r => Category.fromSnapshot(this.toSnapshot(r)));
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM categories WHERE slug = $1', [slug]);
    if (!rows.length) return null;
    return Category.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findById(id: number): Promise<Category | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (!rows.length) return null;
    return Category.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findChildren(id: number): Promise<Category[]> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM categories WHERE parent_id = $1 ORDER BY sort_order, name', [id]);
    return (rows as Record<string, unknown>[]).map(r => Category.fromSnapshot(this.toSnapshot(r)));
  }

  async create(data: Record<string, unknown>): Promise<Category> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO categories (name, name_en, slug, icon, parent_id, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.name, data.name_en ?? null, data.slug, data.icon ?? null, data.parent_id ?? null, data.sort_order ?? 0],
    );
    return Category.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async update(id: number, data: Record<string, unknown>): Promise<Category | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) { fields.push(`${key} = $${idx++}`); values.push(value); }
    }
    if (fields.length === 0) { const p = await this.findById(id); return p ?? undefined; }
    fields.push('updated_at = NOW()');
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (!rows.length) return undefined;
    return Category.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
  }

  private toSnapshot(r: Record<string, unknown>) {
    return { id: r.id as number, name: r.name as string, nameEn: r.name_en as string | null, slug: r.slug as string, icon: r.icon as string | null, parentId: r.parent_id as number | null, sortOrder: r.sort_order as number, createdAt: r.created_at as string, updatedAt: r.updated_at as string };
  }
}
