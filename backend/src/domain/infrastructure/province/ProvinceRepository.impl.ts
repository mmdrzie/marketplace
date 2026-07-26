import { getDb } from '../../../config/database.js';
import { Province, City } from '../../entities/province/Province.entity.js';
import type { ProvinceRepository } from '../../entities/province/Province.repository.js';

export class ProvinceRepositoryImpl implements ProvinceRepository {
  async findAll(): Promise<Province[]> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM provinces ORDER BY sort_order, name');
    return (rows as Record<string, unknown>[]).map(r =>
      Province.fromSnapshot({ id: r.id as number, name: r.name as string, slug: r.slug as string, sortOrder: r.sort_order as number, createdAt: r.created_at as string })
    );
  }

  async findById(id: number): Promise<Province | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM provinces WHERE id = $1', [id]);
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return Province.fromSnapshot({ id: r.id as number, name: r.name as string, slug: r.slug as string, sortOrder: r.sort_order as number, createdAt: r.created_at as string });
  }

  async findBySlug(slug: string): Promise<Province | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM provinces WHERE slug = $1', [slug]);
    if (!rows.length) return null;
    const r = rows[0] as Record<string, unknown>;
    return Province.fromSnapshot({ id: r.id as number, name: r.name as string, slug: r.slug as string, sortOrder: r.sort_order as number, createdAt: r.created_at as string });
  }

  async findCities(provinceId: number): Promise<City[]> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM cities WHERE province_id = $1 ORDER BY name', [provinceId]);
    return (rows as Record<string, unknown>[]).map(r =>
      City.fromSnapshot({ id: r.id as number, provinceId: r.province_id as number, name: r.name as string, createdAt: r.created_at as string })
    );
  }

  async findAllCities(): Promise<Record<number, City[]>> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM cities ORDER BY name');
    const grouped: Record<number, City[]> = {};
    for (const row of rows as Record<string, unknown>[]) {
      const city = City.fromSnapshot({ id: row.id as number, provinceId: row.province_id as number, name: row.name as string, createdAt: row.created_at as string });
      (grouped[city.provinceId] ||= []).push(city);
    }
    return grouped;
  }

  async create(data: { name: string; slug: string; sort_order?: number }): Promise<Province> {
    const db = await getDb();
    const { rows } = await db.query(
      'INSERT INTO provinces (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.slug, data.sort_order ?? 0],
    );
    const r = rows[0] as Record<string, unknown>;
    return Province.fromSnapshot({ id: r.id as number, name: r.name as string, slug: r.slug as string, sortOrder: r.sort_order as number, createdAt: r.created_at as string });
  }

  async update(id: number, data: Record<string, unknown>): Promise<Province | undefined> {
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
    const { rows } = await db.query(`UPDATE provinces SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    if (!rows.length) return undefined;
    const r = rows[0] as Record<string, unknown>;
    return Province.fromSnapshot({ id: r.id as number, name: r.name as string, slug: r.slug as string, sortOrder: r.sort_order as number, createdAt: r.created_at as string });
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM provinces WHERE id = $1', [id]);
  }

  async createCity(provinceId: number, name: string): Promise<City> {
    const db = await getDb();
    const { rows } = await db.query('INSERT INTO cities (province_id, name) VALUES ($1, $2) RETURNING *', [provinceId, name]);
    const r = rows[0] as Record<string, unknown>;
    return City.fromSnapshot({ id: r.id as number, provinceId: r.province_id as number, name: r.name as string, createdAt: r.created_at as string });
  }

  async deleteCity(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM cities WHERE id = $1', [id]);
  }
}
