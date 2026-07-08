import { getDb } from '../config/database';

export interface ProvinceRow {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  created_at: string;
}

export interface CityRow {
  id: number;
  province_id: number;
  name: string;
  created_at: string;
}

export type CreateProvinceData = {
  name: string;
  slug: string;
  sort_order?: number;
};

export type UpdateProvinceData = Partial<CreateProvinceData>;

export class ProvinceRepository {
  async findAll(): Promise<ProvinceRow[]> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM provinces ORDER BY sort_order, name');
    return rows as ProvinceRow[];
  }

  async findById(id: number): Promise<ProvinceRow | undefined> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM provinces WHERE id = $1', [id]);
    return rows[0] as ProvinceRow | undefined;
  }

  async findCities(provinceId: number): Promise<CityRow[]> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM cities WHERE province_id = $1 ORDER BY name',
      [provinceId],
    );
    return rows as CityRow[];
  }

  async create(data: CreateProvinceData): Promise<ProvinceRow> {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO provinces (name, slug, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.slug, data.sort_order ?? 0],
    );
    return rows[0] as ProvinceRow;
  }

  async update(id: number, data: UpdateProvinceData): Promise<ProvinceRow | undefined> {
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

    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE provinces SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return rows[0] as ProvinceRow | undefined;
  }

  async delete(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM provinces WHERE id = $1', [id]);
  }

  async createCity(provinceId: number, name: string): Promise<CityRow> {
    const db = await getDb();
    const { rows } = await db.query(
      'INSERT INTO cities (province_id, name) VALUES ($1, $2) RETURNING *',
      [provinceId, name],
    );
    return rows[0] as CityRow;
  }

  async deleteCity(id: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM cities WHERE id = $1', [id]);
  }
}

export const provinceRepo = new ProvinceRepository();
