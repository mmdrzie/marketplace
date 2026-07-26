import { getDb } from '../../../config/database.js';
import { Attribute } from '../../entities/attribute/Attribute.entity.js';
import type { AttributeRepository } from '../../entities/attribute/Attribute.repository.js';

export class AttributeRepositoryImpl implements AttributeRepository {
  async findByCategory(categoryId: number): Promise<Attribute[]> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM attributes WHERE category_id = $1 ORDER BY sort_order, id', [categoryId]);
    return (rows as Record<string, unknown>[]).map(r => Attribute.fromSnapshot(this.toSnapshot(r)));
  }

  async findById(id: number): Promise<Attribute | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM attributes WHERE id = $1', [id]);
    if (!rows.length) return null;
    return Attribute.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async create(data: Record<string, unknown>): Promise<Attribute> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO attributes (category_id, name, label, type, options, unit, is_required, is_filterable, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [data.category_id, data.name, data.label, data.type, data.options !== undefined ? JSON.stringify(data.options) : null, data.unit ?? null, data.is_required ?? false, data.is_filterable ?? false, data.sort_order ?? 0],
    );
    return Attribute.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async update(id: number, data: Record<string, unknown>): Promise<Attribute | undefined> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const col = key === 'options' ? '"options"' : key;
        fields.push(`${col} = $${idx++}`);
        values.push(key === 'options' ? JSON.stringify(value) : value);
      }
    }
    if (fields.length === 0) { const p = await this.findById(id); return p ?? undefined; }
    fields.push('updated_at = NOW()');
    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(`UPDATE attributes SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (!rows.length) return undefined;
    return Attribute.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM attributes WHERE id = $1', [id]);
  }

  private toSnapshot(r: Record<string, unknown>): Record<string, unknown> {
    return { id: r.id, categoryId: r.category_id, name: r.name, label: r.label, type: r.type, options: r.options, unit: r.unit, isRequired: r.is_required, isFilterable: r.is_filterable, sortOrder: r.sort_order, createdAt: r.created_at, updatedAt: r.updated_at };
  }
}
