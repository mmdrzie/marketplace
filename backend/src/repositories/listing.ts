import { getDb } from '../config/database.js';

export type ListingStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'sold' | 'archived';
export type PriceType = 'fixed' | 'negotiable' | 'auction';

export interface ListingRow {
  id: number;
  user_id: string;
  category_id: number;
  province_id: number | null;
  city_id: number | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  price_type: PriceType;
  status: ListingStatus;
  is_featured: boolean;
  views: number;
  primary_image: string | null;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CreateListingData = {
  user_id: string;
  category_id: number;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  price_type?: PriceType;
  province_id?: number | null;
  city_id?: number | null;
  status?: ListingStatus;
};

export type UpdateListingData = Record<string, unknown>;

export interface ListingFilters {
  scope?: 'me';
  userId?: string;
  category?: string;
  province?: string;
  city_id?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  model?: string;
  year_from?: string;
  year_to?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}

export class ListingRepository {
  async findAll(filters: ListingFilters): Promise<{ data: ListingRow[]; total: number; page: number; lastPage: number }> {
    const wheres: string[] = ['l.deleted_at IS NULL'];
    const params: unknown[] = [];
    let p = 1;

    if (filters.scope === 'me' && filters.userId) {
      wheres.push(`l.user_id = $${p++}`);
      params.push(filters.userId);
    } else if (!filters.status) {
      wheres.push(`l.status = $${p++}`);
      params.push('published');
    }

    if (filters.category) {
      wheres.push(`l.category_id = (SELECT id FROM categories WHERE slug = $${p++})`);
      params.push(filters.category);
    }
    if (filters.province) {
      wheres.push(`l.province_id = (SELECT id FROM provinces WHERE slug = ${p++} OR id::text = ${p++})`);
      params.push(filters.province);
      params.push(filters.province);
    }
    if (filters.status) {
      wheres.push(`l.status = $${p++}`);
      params.push(filters.status);
    }
    if (filters.min_price !== undefined) {
      wheres.push(`l.price >= $${p++}`);
      params.push(filters.min_price);
    }
    if (filters.max_price !== undefined) {
      wheres.push(`l.price <= $${p++}`);
      params.push(filters.max_price);
    }
    if (filters.city_id) {
      wheres.push(`l.city_id = $${p++}`);
      params.push(parseInt(filters.city_id, 10));
    }
    if (filters.brand) {
      wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_b JOIN attributes a_b ON a_b.id = la_b.attribute_id WHERE la_b.listing_id = l.id AND a_b.name = 'brand' AND la_b.value ILIKE $${p++})`);
      params.push(`%${filters.brand}%`);
    }
    if (filters.model) {
      wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_m JOIN attributes a_m ON a_m.id = la_m.attribute_id WHERE la_m.listing_id = l.id AND a_m.name = 'model' AND la_m.value ILIKE $${p++})`);
      params.push(`%${filters.model}%`);
    }
    if (filters.year_from) {
      wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_yf JOIN attributes a_yf ON a_yf.id = la_yf.attribute_id WHERE la_yf.listing_id = l.id AND a_yf.name = 'year' AND la_yf.value::int >= $${p++})`);
      params.push(parseInt(filters.year_from, 10));
    }
    if (filters.year_to) {
      wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_yt JOIN attributes a_yt ON a_yt.id = la_yt.attribute_id WHERE la_yt.listing_id = l.id AND a_yt.name = 'year' AND a_yt.value::int <= $${p++})`);
      params.push(parseInt(filters.year_to, 10));
    }

    const where = wheres.join(' AND ');

    let orderBy = 'ORDER BY l.created_at DESC';
    if (filters.sort === 'price_asc') orderBy = 'ORDER BY l.price ASC';
    else if (filters.sort === 'price_desc') orderBy = 'ORDER BY l.price DESC';
    else if (filters.sort === 'oldest') orderBy = 'ORDER BY l.created_at ASC';
    else if (filters.sort === 'views') orderBy = 'ORDER BY l.views DESC';
    else if (filters.sort === 'title') orderBy = 'ORDER BY l.title ASC';

    const page = filters.page || 1;
    const perPage = filters.perPage || 24;
    const offset = (page - 1) * perPage;

    const db = await getDb();
    const countRes = await db.query(`SELECT COUNT(*) as total FROM listings l WHERE ${where}`, params);
    const total = parseInt((countRes.rows[0] as { total: string }).total, 10);

    const { rows } = await db.query(
      `SELECT l.*, c.name as category_name, c.slug as category_slug, p.name as province_name,
              u.id as seller_id, u.name as seller_name, ci.name as city_name
       FROM listings l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN provinces p ON p.id = l.province_id
       LEFT JOIN users u ON u.id = l.user_id
       LEFT JOIN cities ci ON ci.id = l.city_id
       WHERE ${where} ${orderBy} LIMIT $${p++} OFFSET $${p++}`,
      [...params, perPage, offset],
    );

    return { data: rows as ListingRow[], total, page, lastPage: Math.ceil(total / perPage) };
  }

  async findBySlug(slug: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT l.*,
              c.name as category_name, c.slug as category_slug,
              p.name as province_name,
              u.id as seller_id, u.name as seller_name, u.avatar as seller_avatar,
              ci.name as city_name
       FROM listings l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN provinces p ON p.id = l.province_id
       LEFT JOIN users u ON u.id = l.user_id
       LEFT JOIN cities ci ON ci.id = l.city_id
       WHERE l.slug = $1 AND l.deleted_at IS NULL`,
      [slug],
    );
    return rows[0] as ListingRow & { category_name?: string; category_slug?: string; province_name?: string; seller_name?: string; seller_avatar?: string } | undefined;
  }

  async findById(id: number) {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM listings WHERE id = $1 AND deleted_at IS NULL', [id]);
    return rows[0] as ListingRow | undefined;
  }

  async findAttributes(listingId: number) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT la.*, a.name, a.label, a.type, a.unit
       FROM listing_attributes la
       JOIN attributes a ON a.id = la.attribute_id
       WHERE la.listing_id = $1
       ORDER BY a.sort_order`,
      [listingId],
    );
    return rows as { id: number; listing_id: number; attribute_id: number; value: string; name: string; label: string; type: string; unit: string | null }[];
  }

  async findImages(listingId: number) {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM listing_images WHERE listing_id = $1 ORDER BY sort_order, id',
      [listingId],
    );
    return rows as { id: number; listing_id: number; url: string; thumbnail_url: string | null; medium_url: string | null; is_primary: boolean; sort_order: number; created_at: string }[];
  }

  async create(data: CreateListingData) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO listings (user_id, category_id, province_id, city_id, title, slug, description, price, price_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [data.user_id, data.category_id, data.province_id ?? null, data.city_id ?? null, data.title, data.slug, data.description ?? '', data.price ?? 0, data.price_type ?? 'fixed', data.status ?? 'draft'],
    );
    return rows[0] as ListingRow;
  }

  async update(id: number, data: UpdateListingData) {
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
      `UPDATE listings SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`,
      values,
    );
    return rows[0] as ListingRow | undefined;
  }

  async updateStatus(id: number, status: ListingStatus, extraFields?: Record<string, unknown>) {
    const fields: string[] = ['status = $1', 'updated_at = NOW()'];
    const values: unknown[] = [status];

    if (extraFields) {
      let idx = 2;
      for (const [key, value] of Object.entries(extraFields)) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }

    values.push(id);
    const db = await getDb();
    const { rows } = await db.query(
      `UPDATE listings SET ${fields.join(', ')} WHERE id = $${values.length} AND deleted_at IS NULL RETURNING *`,
      values,
    );
    return rows[0] as ListingRow | undefined;
  }

  async softDelete(id: number) {
    const db = await getDb();
    await db.query('UPDATE listings SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1', [id]);
  }

  async incrementViews(id: number) {
    const db = await getDb();
    await db.query('UPDATE listings SET views = views + 1 WHERE id = $1', [id]);
  }

  async setAttributes(listingId: number, attributes: { attribute_id: number; value: string }[]) {
    const db = await getDb();
    await db.query('DELETE FROM listing_attributes WHERE listing_id = $1', [listingId]);
    for (const attr of attributes) {
      await db.query(
        'INSERT INTO listing_attributes (listing_id, attribute_id, value) VALUES ($1, $2, $3)',
        [listingId, attr.attribute_id, attr.value],
      );
    }
  }

  async addImage(listingId: number, data: { url: string; thumbnail_url?: string; medium_url?: string; is_primary?: boolean; sort_order?: number }) {
    const db = await getDb();
    const { rows } = await db.query(
      `INSERT INTO listing_images (listing_id, url, thumbnail_url, medium_url, is_primary, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [listingId, data.url, data.thumbnail_url ?? null, data.medium_url ?? null, data.is_primary ?? false, data.sort_order ?? 0],
    );
    return rows[0];
  }

  async removeImage(id: number) {
    const db = await getDb();
    await db.query('DELETE FROM listing_images WHERE id = $1', [id]);
  }

  async search(q: string, filters: Omit<ListingFilters, 'scope'>): Promise<{ data: ListingRow[]; total: number; page: number; lastPage: number }> {
    const term = `%${q}%`;
    const wheres: string[] = ['l.deleted_at IS NULL', 'l.status = $1', '(l.title ILIKE $2 OR l.description ILIKE $3)'];
    const params: unknown[] = ['published', term, term];
    let p = 4;

    if (filters.category) {
      wheres.push(`l.category_id = (SELECT id FROM categories WHERE slug = $${p++})`);
      params.push(filters.category);
    }
    if (filters.province) {
      wheres.push(`l.province_id = (SELECT id FROM provinces WHERE slug = ${p++} OR id::text = ${p++})`);
      params.push(filters.province);
      params.push(filters.province);
    }
    if (filters.min_price !== undefined) {
      wheres.push(`l.price >= $${p++}`);
      params.push(filters.min_price);
    }
    if (filters.max_price !== undefined) {
      wheres.push(`l.price <= $${p++}`);
      params.push(filters.max_price);
    }
    if (filters.city_id) {
      wheres.push(`l.city_id = $${p++}`);
      params.push(parseInt(filters.city_id, 10));
    }
    if (filters.brand) {
      wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_b JOIN attributes a_b ON a_b.id = la_b.attribute_id WHERE la_b.listing_id = l.id AND a_b.name = 'brand' AND la_b.value ILIKE $${p++})`);
      params.push(`%${filters.brand}%`);
    }
    if (filters.model) {
      wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_m JOIN attributes a_m ON a_m.id = la_m.attribute_id WHERE la_m.listing_id = l.id AND a_m.name = 'model' AND la_m.value ILIKE $${p++})`);
      params.push(`%${filters.model}%`);
    }
    if (filters.year_from) {
      wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_yf JOIN attributes a_yf ON a_yf.id = la_yf.attribute_id WHERE la_yf.listing_id = l.id AND a_yf.name = 'year' AND la_yf.value::int >= $${p++})`);
      params.push(parseInt(filters.year_from, 10));
    }
    if (filters.year_to) {
      wheres.push(`EXISTS (SELECT 1 FROM listing_attributes la_yt JOIN attributes a_yt ON a_yt.id = la_yt.attribute_id WHERE la_yt.listing_id = l.id AND a_yt.name = 'year' AND a_yt.value::int <= $${p++})`);
      params.push(parseInt(filters.year_to, 10));
    }

    const where = wheres.join(' AND ');

    let orderBy = 'ORDER BY CASE WHEN l.title ILIKE $2 THEN 0 WHEN l.description ILIKE $2 THEN 1 ELSE 2 END, l.created_at DESC';
    if (filters.sort === 'price_asc') orderBy = 'ORDER BY l.price ASC';
    else if (filters.sort === 'price_desc') orderBy = 'ORDER BY l.price DESC';
    else if (filters.sort === 'oldest') orderBy = 'ORDER BY l.created_at ASC';
    else if (filters.sort === 'newest') orderBy = 'ORDER BY l.created_at DESC';
    else if (filters.sort === 'views') orderBy = 'ORDER BY l.views DESC';
    else if (filters.sort === 'title') orderBy = 'ORDER BY l.title ASC';

    const page = filters.page || 1;
    const perPage = filters.perPage || 24;
    const offset = (page - 1) * perPage;

    const db = await getDb();
    const countRes = await db.query(`SELECT COUNT(*) as total FROM listings l WHERE ${where}`, params);
    const total = parseInt((countRes.rows[0] as { total: string }).total, 10);

    const { rows } = await db.query(
      `SELECT l.*
       FROM listings l
       WHERE ${where}
       ${orderBy}
       LIMIT $${p++} OFFSET $${p++}`,
      [...params, perPage, offset],
    );

    return { data: rows as ListingRow[], total, page, lastPage: Math.ceil(total / perPage) };
  }
}

export const listingRepo = new ListingRepository();
