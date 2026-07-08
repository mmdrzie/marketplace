import { getDb } from '../config/database';

export interface AttributeRow {
  id: number;
  category_id: number;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'range' | 'color';
  options: unknown | null;
  unit: string | null;
  is_required: boolean;
  is_filterable: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateAttributeData = {
  category_id: number;
  name: string;
  label: string;
  type: string;
  options?: unknown;
  unit?: string;
  is_required?: boolean;
  is_filterable?: boolean;
  sort_order?: number;
};

export type UpdateAttributeData = Partial<Omit<CreateAttributeData, 'category_id'>>;

export class AttributeRepository {
  async findByCategory(categoryId: number): Promise<AttributeRow[]> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM attributes WHERE category_id = $1 ORDER BY sort_order, id',
      [categoryId],
    );
    return rows as AttributeRow[];
  }

  async findById(id: number): Promise<AttributeRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM attributes WHERE id = $1', [id]);
    return rows[0] as AttributeRow | undefined;
  }

  async create(data: CreateAttributeData): Promise<AttributeRow> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO attributes (category_id, name, label, type, options, unit, is_required, is_filterable, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.category_id,
        data.name,
        data.label,
        data.type,
        data.options !== undefined ? JSON.stringify(data.options) : null,
        data.unit ?? null,
        data.is_required ?? false,
        data.is_filterable ?? false,
        data.sort_order ?? 0,
      ],
    );
    return rows[0] as AttributeRow;
  }

  async update(id: number, data: UpdateAttributeData): Promise<AttributeRow | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const col = key === 'options' ? `"options"` : key;
        fields.push(`${col} = $${idx++}`);
        values.push(key === 'options' ? JSON.stringify(value) : value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE attributes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] as AttributeRow | undefined;
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM attributes WHERE id = $1', [id]);
  }
}

export const attributeRepo = new AttributeRepository();
