import { getDb } from '../config/database.js';

export interface CategoryRow {
  id: number;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  parent_id: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateCategoryData = {
  name: string;
  name_en?: string;
  slug: string;
  icon?: string;
  parent_id?: number | null;
  sort_order?: number;
};

export type UpdateCategoryData = Partial<CreateCategoryData>;

export class CategoryRepository {
  async findAll(): Promise<CategoryRow[]> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM categories ORDER BY sort_order, name');
    return rows as CategoryRow[];
  }

  async findBySlug(slug: string): Promise<CategoryRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM categories WHERE slug = $1', [slug]);
    return rows[0] as CategoryRow | undefined;
  }

  async findById(id: number): Promise<CategoryRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    return rows[0] as CategoryRow | undefined;
  }

  async findChildren(id: number): Promise<CategoryRow[]> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM categories WHERE parent_id = $1 ORDER BY sort_order, name',
      [id],
    );
    return rows as CategoryRow[];
  }

  async create(data: CreateCategoryData): Promise<CategoryRow> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO categories (name, name_en, slug, icon, parent_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.name_en ?? null, data.slug, data.icon ?? null, data.parent_id ?? null, data.sort_order ?? 0],
    );
    return rows[0] as CategoryRow;
  }

  async update(id: number, data: UpdateCategoryData): Promise<CategoryRow | undefined> {
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

    fields.push('updated_at = NOW()');
    values.push(id);

    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] as CategoryRow | undefined;
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM categories WHERE id = $1', [id]);
  }
}

export const categoryRepo = new CategoryRepository();
