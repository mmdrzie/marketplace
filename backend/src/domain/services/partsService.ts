import { getDb } from '../../config/database.js';

export class PartsService {
  async getCategories(parentId?: number | null) {
    const db = await getDb();
    if (parentId === undefined) {
      const { rows } = await db.query('SELECT * FROM parts_categories ORDER BY sort_order, name');
      return rows;
    }
    let sql: string;
    let params: any[];
    if (parentId === null) {
      sql = 'SELECT * FROM parts_categories WHERE parent_id IS NULL ORDER BY sort_order, name';
      params = [];
    } else {
      sql = 'SELECT * FROM parts_categories WHERE parent_id = $1 ORDER BY sort_order, name';
      params = [parentId];
    }
    const { rows } = await db.query(sql, params);
    return rows;
  }

  async getCategoryTree() {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM parts_categories ORDER BY sort_order, name');
    const map = new Map<number, any>();
    const roots: any[] = [];
    for (const r of rows as any[]) {
      r.children = [];
      map.set(r.id, r);
    }
    for (const r of rows as any[]) {
      if (r.parent_id && map.has(r.parent_id)) {
        map.get(r.parent_id).children.push(r);
      } else if (!r.parent_id) {
        roots.push(r);
      }
    }
    return roots;
  }

  async getCategoryBySlug(slug: string) {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM parts_categories WHERE slug = $1', [slug]);
    if (!rows[0]) return null;
    const cat = rows[0] as any;
    const { rows: children } = await db.query(
      'SELECT * FROM parts_categories WHERE parent_id = $1 ORDER BY sort_order, name',
      [cat.id]
    );
    cat.children = children;
    return cat;
  }

  async listParts(filters: {
    partsCategorySlug?: string;
    partsCategoryId?: number;
    brandId?: string;
    modelId?: number;
    year?: number;
    q?: string;
    storeSlug?: string;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    limit?: number;
  }) {
    const db = await getDb();
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (filters.partsCategorySlug) {
      conditions.push(`pc.slug = $${idx++}`);
      params.push(filters.partsCategorySlug);
    }
    if (filters.partsCategoryId) {
      conditions.push(`p.parts_category_id = $${idx++}`);
      params.push(filters.partsCategoryId);
    }
    if (filters.brandId) {
      conditions.push(`(p.brand_id = $${idx} OR pcm.brand_id = $${idx})`);
      params.push(filters.brandId);
      idx++;
    }
    if (filters.modelId) {
      conditions.push(`(p.model_id = $${idx} OR pcm.model_id = $${idx})`);
      params.push(filters.modelId);
      idx++;
    }
    if (filters.year) {
      conditions.push(`(p.year_from <= $${idx} AND p.year_to >= $${idx})`);
      params.push(filters.year);
      idx++;
    }
    if (filters.q) {
      conditions.push(`(p.name ILIKE $${idx} OR p.part_number ILIKE $${idx} OR p.oem_number ILIKE $${idx} OR p.description ILIKE $${idx})`);
      params.push(`%${filters.q}%`);
      idx++;
    }
    if (filters.storeSlug) {
      conditions.push(`sp.store_slug = $${idx++}`);
      params.push(filters.storeSlug);
    }
    if (filters.priceMin !== undefined) {
      conditions.push(`si.price >= $${idx++}`);
      params.push(filters.priceMin);
    }
    if (filters.priceMax !== undefined) {
      conditions.push(`si.price <= $${idx++}`);
      params.push(filters.priceMax);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const limit = filters.limit || 24;
    const offset = ((filters.page || 1) - 1) * limit;

    const sql = `
      SELECT DISTINCT p.*, pc.name AS category_name, pc.slug AS category_slug
      FROM parts p
      LEFT JOIN parts_categories pc ON pc.id = p.parts_category_id
      LEFT JOIN part_compatible_models pcm ON pcm.part_id = p.id
      LEFT JOIN store_inventory si ON si.part_id = p.id AND si.status = 'active'
      LEFT JOIN store_profiles sp ON sp.user_id = si.store_id AND sp.status = 'approved'
      ${where}
      ORDER BY p.name ASC
      LIMIT $${idx++} OFFSET $${idx}
    `;
    params.push(limit, offset);

    const { rows } = await db.query(sql, params);
    return rows;
  }

  async getPartById(id: number) {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT p.*, pc.name AS category_name, pc.slug AS category_slug
      FROM parts p
      LEFT JOIN parts_categories pc ON pc.id = p.parts_category_id
      WHERE p.id = $1
    `, [id]);
    if (!rows[0]) return null;
    const part = rows[0] as any;

    const { rows: stores } = await db.query(`
      SELECT si.id AS inventory_id, si.price, si.stock_count, si.status AS stock_status,
             sp.store_name, sp.store_slug, sp.logo, u.id AS store_user_id
      FROM store_inventory si
      JOIN store_profiles sp ON sp.user_id = si.store_id AND sp.status = 'approved'
      JOIN users u ON u.id = si.store_id
      WHERE si.part_id = $1 AND si.status = 'active'
      ORDER BY si.price ASC
    `, [id]);
    part.stores = stores;

    const { rows: compatible } = await db.query(`
      SELECT pcm.*, b.name AS brand_name, b.slug AS brand_slug,
             vm.name AS model_name
      FROM part_compatible_models pcm
      LEFT JOIN brands b ON b.id = pcm.brand_id
      LEFT JOIN vehicle_models vm ON vm.id = pcm.model_id
      WHERE pcm.part_id = $1
    `, [id]);
    part.compatible_models = compatible;

    return part;
  }

  async getStoresForPart(partId: number) {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT si.*, sp.store_name, sp.store_slug, sp.logo, sp.description AS store_description
      FROM store_inventory si
      JOIN store_profiles sp ON sp.user_id = si.store_id
      WHERE si.part_id = $1 AND si.status = 'active' AND sp.status = 'approved'
      ORDER BY si.price ASC
    `, [partId]);
    return rows;
  }

  async searchByVehicle(brandId: string, modelId?: number, year?: number) {
    const db = await getDb();
    const conditions: string[] = ['pcm.brand_id = $1'];
    const params: any[] = [brandId];
    let idx = 2;

    if (modelId) {
      conditions.push(`(pcm.model_id = $${idx} OR pcm.model_id IS NULL)`);
      params.push(modelId);
      idx++;
    }
    if (year) {
      conditions.push(`(pcm.year_from <= $${idx} AND pcm.year_to >= $${idx})`);
      params.push(year);
      idx++;
    }

    const { rows } = await db.query(`
      SELECT DISTINCT p.*, pc.name AS category_name, pc.slug AS category_slug
      FROM part_compatible_models pcm
      JOIN parts p ON p.id = pcm.part_id
      LEFT JOIN parts_categories pc ON pc.id = p.parts_category_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.name ASC
    `, params);
    return rows;
  }

  async listStores(filters?: { q?: string }) {
    const db = await getDb();
    if (filters?.q) {
      const { rows } = await db.query(`
        SELECT sp.*, u.name AS owner_name,
          (SELECT COUNT(*) FROM store_inventory WHERE store_id = sp.user_id AND status = 'active') AS part_count
        FROM store_profiles sp
        JOIN users u ON u.id = sp.user_id
        WHERE sp.status = 'approved' AND (sp.store_name ILIKE $1 OR sp.store_slug ILIKE $1 OR u.name ILIKE $1)
        ORDER BY sp.store_name ASC
      `, [`%${filters.q}%`]);
      return rows;
    }
    const { rows } = await db.query(`
      SELECT sp.*, u.name AS owner_name,
        (SELECT COUNT(*) FROM store_inventory WHERE store_id = sp.user_id AND status = 'active') AS part_count
      FROM store_profiles sp
      JOIN users u ON u.id = sp.user_id
      WHERE sp.status = 'approved'
      ORDER BY sp.store_name ASC
    `);
    return rows;
  }

  async getStoreBySlug(slug: string) {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT sp.*, u.name AS owner_name, u.phone AS owner_phone
      FROM store_profiles sp
      JOIN users u ON u.id = sp.user_id
      WHERE sp.store_slug = $1 AND sp.status = 'approved'
    `, [slug]);
    if (!rows[0]) return null;

    const store = rows[0] as any;
    const { rows: inventory } = await db.query(`
      SELECT si.*, p.name AS part_name, p.part_number, p.oem_number, p.images,
             pc.name AS category_name, pc.slug AS category_slug
      FROM store_inventory si
      JOIN parts p ON p.id = si.part_id
      LEFT JOIN parts_categories pc ON pc.id = p.parts_category_id
      WHERE si.store_id = $1 AND si.status = 'active'
      ORDER BY p.name ASC
    `, [store.user_id]);
    store.inventory = inventory;
    return store;
  }

  async createSuggestion(storeId: string, data: {
    name: string; partNumber?: string; oemNumber?: string;
    partsCategoryId?: number; brandId?: string; modelId?: number;
    yearFrom?: number; yearTo?: number; description?: string; manufacturer?: string;
    partTypeId?: number; catalogCategoryId?: number;
  }) {
    const db = await getDb();
    const { rows } = await db.query(`
      INSERT INTO part_suggestions (store_id, name, part_number, oem_number, parts_category_id,
        brand_id, model_id, year_from, year_to, description, manufacturer,
        part_type_id, catalog_category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [storeId, data.name, data.partNumber || '', data.oemNumber || '',
        data.partsCategoryId || null, data.brandId || null, data.modelId || null,
        data.yearFrom || 0, data.yearTo || 0, data.description || '', data.manufacturer || '',
        data.partTypeId || null, data.catalogCategoryId || null]);
    return rows[0];
  }

  async getStoreSuggestions(storeId: string) {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM part_suggestions WHERE store_id = $1 ORDER BY created_at DESC',
      [storeId]
    );
    return rows;
  }

  async registerStoreProfile(userId: string, data: {
    storeName: string; storeSlug: string; description?: string;
    address?: string; phone?: string; documents?: string[];
  }) {
    const db = await getDb();
    const { rows } = await db.query(`
      INSERT INTO store_profiles (user_id, store_name, store_slug, description, address, phone, documents)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        store_name = EXCLUDED.store_name, description = EXCLUDED.description,
        address = EXCLUDED.address, phone = EXCLUDED.phone,
        documents = EXCLUDED.documents, status = 'pending',
        updated_at = NOW()
      RETURNING *
    `, [userId, data.storeName, data.storeSlug, data.description || '',
        data.address || '', data.phone || '', data.documents || []]);
    return rows[0];
  }

  async getStoreProfile(userId: string) {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM store_profiles WHERE user_id = $1', [userId]);
    return rows[0] || null;
  }

  async updateStoreProfile(userId: string, data: Record<string, any>) {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (!fields.length) return this.getStoreProfile(userId);
    values.push(userId);
    const { rows } = await db.query(
      `UPDATE store_profiles SET ${fields.join(', ')}, updated_at = NOW() WHERE user_id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }

  async getStoreInventory(storeId: string, filters?: { status?: string; partsCategoryId?: number }) {
    const db = await getDb();
    const conditions = ['si.store_id = $1'];
    const params: any[] = [storeId];
    let idx = 2;

    if (filters?.status) {
      conditions.push(`si.status = $${idx++}`);
      params.push(filters.status);
    }
    if (filters?.partsCategoryId) {
      conditions.push(`p.parts_category_id = $${idx++}`);
      params.push(filters.partsCategoryId);
    }

    const { rows } = await db.query(`
      SELECT si.*, p.name AS part_name, p.part_number, p.oem_number, p.images,
             pc.name AS category_name, pc.slug AS category_slug
      FROM store_inventory si
      JOIN parts p ON p.id = si.part_id
      LEFT JOIN parts_categories pc ON pc.id = p.parts_category_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.name ASC
    `, params);
    return rows;
  }

  async addStoreInventory(storeId: string, data: { partId: number; price: number; stockCount: number; notes?: string }) {
    const db = await getDb();
    const profile = await this.getStoreProfile(storeId);
    if (!profile || (profile as any).status !== 'approved') {
      throw new Error('فروشگاه شما تأیید نشده است');
    }
    const { rows } = await db.query(`
      INSERT INTO store_inventory (store_id, part_id, price, stock_count, notes)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (store_id, part_id) DO UPDATE SET
        price = EXCLUDED.price, stock_count = EXCLUDED.stock_count,
        notes = EXCLUDED.notes, status = 'active', updated_at = NOW()
      RETURNING *
    `, [storeId, data.partId, data.price, data.stockCount, data.notes || '']);
    return rows[0];
  }

  async updateStoreInventory(storeId: string, inventoryId: number, data: {
    price?: number; stockCount?: number; status?: string; notes?: string;
  }) {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (!fields.length) throw new Error('No fields to update');
    values.push(inventoryId, storeId);
    const { rows } = await db.query(
      `UPDATE store_inventory SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} AND store_id = $${idx+1} RETURNING *`,
      values
    );
    return rows[0];
  }

  async deleteStoreInventory(storeId: string, inventoryId: number) {
    const db = await getDb();
    await db.query('DELETE FROM store_inventory WHERE id = $1 AND store_id = $2', [inventoryId, storeId]);
  }

  async getInventoryStats(storeId: string) {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT
        COUNT(*)::int AS total_items,
        COUNT(*) FILTER (WHERE status = 'active')::int AS active_items,
        COUNT(*) FILTER (WHERE status = 'out_of_stock')::int AS out_of_stock,
        COALESCE(SUM(stock_count) FILTER (WHERE status = 'active'), 0)::int AS total_stock
      FROM store_inventory WHERE store_id = $1
    `, [storeId]);
    return rows[0];
  }

  // Admin: manage stores
  async adminListStores(statusFilter?: string) {
    const db = await getDb();
    if (statusFilter) {
      const { rows } = await db.query(`
        SELECT sp.*, u.name AS owner_name, u.email AS owner_email,
          (SELECT COUNT(*) FROM store_inventory WHERE store_id = sp.user_id) AS part_count
        FROM store_profiles sp JOIN users u ON u.id = sp.user_id
        WHERE sp.status = $1 ORDER BY sp.created_at DESC
      `, [statusFilter]);
      return rows;
    }
    const { rows } = await db.query(`
      SELECT sp.*, u.name AS owner_name, u.email AS owner_email,
        (SELECT COUNT(*) FROM store_inventory WHERE store_id = sp.user_id) AS part_count
      FROM store_profiles sp JOIN users u ON u.id = sp.user_id
      ORDER BY sp.created_at DESC
    `);
    return rows;
  }

  async adminApproveStore(userId: string) {
    const db = await getDb();
    const { rows } = await db.query(`
      UPDATE store_profiles SET status = 'approved', approved_at = NOW(), updated_at = NOW()
      WHERE user_id = $1 RETURNING *
    `, [userId]);
    return rows[0];
  }

  async adminRejectStore(userId: string, note: string) {
    const db = await getDb();
    const { rows } = await db.query(`
      UPDATE store_profiles SET status = 'rejected', admin_note = $2, updated_at = NOW()
      WHERE user_id = $1 RETURNING *
    `, [userId, note]);
    return rows[0];
  }

  // Admin: manage parts
  async adminListParts(filters?: { q?: string; partsCategoryId?: number; partTypeId?: number }) {
    const db = await getDb();
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (filters?.q) {
      conditions.push(`(p.name ILIKE $${idx} OR p.part_number ILIKE $${idx} OR p.oem_number ILIKE $${idx})`);
      params.push(`%${filters.q}%`);
      idx++;
    }
    if (filters?.partsCategoryId) {
      conditions.push(`p.parts_category_id = $${idx++}`);
      params.push(filters.partsCategoryId);
    }
    if (filters?.partTypeId) {
      conditions.push(`p.part_type_id = $${idx++}`);
      params.push(filters.partTypeId);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const { rows } = await db.query(`
      SELECT p.*, pc.name AS category_name, pc.slug AS category_slug,
        pt.label AS part_type_label, pt.slug AS part_type_slug, pt.color AS part_type_color,
        cc.title AS catalog_category_name, cc.path AS catalog_category_path,
        ct.slug AS catalog_slug
      FROM parts p
      LEFT JOIN parts_categories pc ON pc.id = p.parts_category_id
      LEFT JOIN part_types pt ON pt.id = p.part_type_id
      LEFT JOIN catalog_categories cc ON cc.id = p.catalog_category_id
      LEFT JOIN catalog_types ct ON ct.id = cc.catalog_type_id
      ${where} ORDER BY p.name ASC
    `, params);
    return rows;
  }

  async adminCreatePart(data: {
    name: string; partNumber?: string; category?: string; categoryLabel?: string;
    price?: number; description?: string; manufacturer?: string; warranty?: string;
    partsCategoryId?: number; brandId?: string; modelId?: number;
    yearFrom?: number; yearTo?: number; oemNumber?: string;
    partTypeId?: number; catalogCategoryId?: number;
    specs?: { catalogTypeId: number; specs: any } | null;
  }) {
    const db = await getDb();
    const { rows } = await db.query(`
      INSERT INTO parts (name, part_number, category, category_label, price, description,
        manufacturer, warranty, parts_category_id, brand_id, model_id, year_from, year_to, oem_number,
        part_type_id, catalog_category_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `, [data.name, data.partNumber || '', data.category || 'aftermarket', data.categoryLabel || '',
        data.price || 0, data.description || '', data.manufacturer || '', data.warranty || '',
        data.partsCategoryId || null, data.brandId || null, data.modelId || null,
        data.yearFrom || 0, data.yearTo || 0, data.oemNumber || '',
        data.partTypeId || null, data.catalogCategoryId || null]);
    const part = rows[0] as any;
    if (data.specs?.catalogTypeId && data.specs.specs) {
      await this.adminSetPartSpecs(part.id, data.specs.catalogTypeId, data.specs.specs);
    }
    return part;
  }

  async adminUpdatePart(id: number, data: Record<string, any>) {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (!fields.length) throw new Error('No fields to update');
    values.push(id);
    const { rows } = await db.query(
      `UPDATE parts SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }

  async adminDeletePart(id: number) {
    const db = await getDb();
    await db.query('DELETE FROM parts WHERE id = $1', [id]);
  }

  // Admin: manage categories
  async adminCreateCategory(data: { name: string; slug: string; parentId?: number; icon?: string; description?: string; sortOrder?: number }) {
    const db = await getDb();
    const { rows } = await db.query(`
      INSERT INTO parts_categories (parent_id, name, slug, icon, description, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `, [data.parentId || null, data.name, data.slug, data.icon || '',
        data.description || '', data.sortOrder || 0]);
    return rows[0];
  }

  async adminUpdateCategory(id: number, data: Record<string, any>) {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (!fields.length) throw new Error('No fields to update');
    values.push(id);
    const { rows } = await db.query(
      `UPDATE parts_categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }

  async adminDeleteCategory(id: number) {
    const db = await getDb();
    await db.query('DELETE FROM parts_categories WHERE id = $1', [id]);
  }

  // Admin: suggestions
  async adminListSuggestions(statusFilter?: string) {
    const db = await getDb();
    if (statusFilter) {
      const { rows } = await db.query(`
        SELECT ps.*, u.name AS store_name, u.email AS store_email
        FROM part_suggestions ps JOIN users u ON u.id = ps.store_id
        WHERE ps.status = $1 ORDER BY ps.created_at DESC
      `, [statusFilter]);
      return rows;
    }
    const { rows } = await db.query(`
      SELECT ps.*, u.name AS store_name, u.email AS store_email
      FROM part_suggestions ps JOIN users u ON u.id = ps.store_id
      ORDER BY ps.created_at DESC
    `);
    return rows;
  }

  async adminApproveSuggestion(id: number) {
    const db = await getDb();
    const { rows } = await db.query(
      "UPDATE part_suggestions SET status = 'approved', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (!rows[0]) throw new Error('Suggestion not found');
    const s = rows[0] as any;
    await this.adminCreatePart({
      name: s.name,
      partNumber: s.part_number,
      oemNumber: s.oem_number,
      partsCategoryId: s.parts_category_id,
      brandId: s.brand_id,
      modelId: s.model_id,
      yearFrom: s.year_from,
      yearTo: s.year_to,
      description: s.description,
      manufacturer: s.manufacturer,
      partTypeId: s.part_type_id,
      catalogCategoryId: s.catalog_category_id,
    });
    return s;
  }

  async adminRejectSuggestion(id: number, note: string) {
    const db = await getDb();
    const { rows } = await db.query(
      'UPDATE part_suggestions SET status = $2, admin_note = $3, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id, 'rejected', note]
    );
    return rows[0];
  }

  // -------------------------------------------------------------------------
  // Generic Catalog Domain (ADR-011) — /v2/catalogs/*
  // Tuning and future catalogs (audio, camping, ...) are views over the same
  // `parts` aggregate; all query logic lives here, not in the controller.
  // -------------------------------------------------------------------------

  async getCatalogTypes(publicOnly = true) {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT id, slug, label, icon, color, sort_order, settings, settings_version
      FROM catalog_types
      WHERE is_active = true AND ($1::boolean = false OR is_public = true)
      ORDER BY sort_order, slug
    `, [publicOnly]);
    return rows;
  }

  async getCatalogTypeBySlug(slug: string, publicOnly = true) {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT id, slug, label, icon, color, sort_order, settings, settings_version
      FROM catalog_types
      WHERE slug = $1 AND is_active = true AND ($2::boolean = false OR is_public = true)
    `, [slug, publicOnly]);
    return rows[0] || null;
  }

  private async getCatalogTypeId(db: any, slug: string): Promise<number | null> {
    const { rows } = await db.query(
      'SELECT id FROM catalog_types WHERE slug = $1 AND is_active = true',
      [slug]
    );
    return rows[0]?.id ?? null;
  }

  async getCatalogCategories(catalogSlug: string) {
    const db = await getDb();
    const typeId = await this.getCatalogTypeId(db, catalogSlug);
    if (!typeId) return [];
    const { rows } = await db.query(`
      SELECT cc.*,
        (SELECT COUNT(*)::int FROM parts p WHERE p.catalog_category_id = cc.id) AS part_count
      FROM catalog_categories cc
      WHERE cc.catalog_type_id = $1 AND cc.deleted_at IS NULL
      ORDER BY cc.sort_order, cc.title
    `, [typeId]);
    const map = new Map<number, any>();
    const roots: any[] = [];
    for (const r of rows as any[]) {
      r.children = [];
      map.set(r.id, r);
    }
    for (const r of rows as any[]) {
      if (r.parent_id && map.has(r.parent_id)) {
        map.get(r.parent_id).children.push(r);
      } else if (!r.parent_id) {
        roots.push(r);
      }
    }
    return roots;
  }

  async getCatalogCategoryById(catalogSlug: string, id: number) {
    const db = await getDb();
    const typeId = await this.getCatalogTypeId(db, catalogSlug);
    if (!typeId) return null;
    const { rows } = await db.query(`
      SELECT cc.*,
        (SELECT COUNT(*)::int FROM parts p WHERE p.catalog_category_id = cc.id) AS part_count
      FROM catalog_categories cc
      WHERE cc.id = $1 AND cc.catalog_type_id = $2 AND cc.deleted_at IS NULL
    `, [id, typeId]);
    if (!rows[0]) return null;
    const cat = rows[0] as any;
    const { rows: children } = await db.query(`
      SELECT cc.*,
        (SELECT COUNT(*)::int FROM parts p WHERE p.catalog_category_id = cc.id) AS part_count
      FROM catalog_categories cc
      WHERE cc.parent_id = $1 AND cc.deleted_at IS NULL
      ORDER BY cc.sort_order, cc.title
    `, [id]);
    cat.children = children;
    return cat;
  }

  async listCatalogParts(filters: {
    catalogSlug: string;
    categoryId?: number;
    brandId?: string;
    modelId?: number;
    year?: number;
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) {
    const db = await getDb();
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;

    conditions.push(`ct.slug = $${idx++}`);
    params.push(filters.catalogSlug);

    if (filters.categoryId) {
      // include the category and all of its descendants (path prefix)
      conditions.push(`(
        cc.id = $${idx} OR
        cc.path LIKE (SELECT path FROM catalog_categories WHERE id = $${idx}) || '/%'
      )`);
      params.push(filters.categoryId);
      idx++;
    }
    if (filters.brandId) {
      conditions.push(`(p.brand_id = $${idx} OR pcm.brand_id = $${idx})`);
      params.push(filters.brandId);
      idx++;
    }
    if (filters.modelId) {
      conditions.push(`(p.model_id = $${idx} OR pcm.model_id = $${idx})`);
      params.push(filters.modelId);
      idx++;
    }
    if (filters.year) {
      conditions.push(`(pcm.year_from <= $${idx} AND pcm.year_to >= $${idx})`);
      params.push(filters.year);
      idx++;
    }
    if (filters.q) {
      conditions.push(`(
        p.name ILIKE $${idx} OR p.part_number ILIKE $${idx} OR
        p.oem_number ILIKE $${idx} OR p.description ILIKE $${idx}
      )`);
      params.push(`%${filters.q}%`);
      idx++;
    }

    const where = 'WHERE ' + conditions.join(' AND ');
    const limit = filters.limit || 24;
    const offset = ((filters.page || 1) - 1) * limit;

    const orderBy = {
      name: 'p.name ASC',
      newest: 'p.created_at DESC',
      price_asc: 'min_price ASC NULLS LAST',
      price_desc: 'min_price DESC NULLS LAST',
    }[filters.sort || 'name'] || 'p.name ASC';

    const sql = `
      SELECT DISTINCT p.*, cc.title AS category_name, cc.slug AS category_slug,
        cc.path AS category_path, cc.depth AS category_depth,
        pt.label AS part_type_label, pt.slug AS part_type_slug,
        pt.color AS part_type_color, pt.icon AS part_type_icon,
        (SELECT MIN(si2.price) FROM store_inventory si2
          WHERE si2.part_id = p.id AND si2.status = 'active') AS min_price,
        (SELECT COUNT(*)::int FROM store_inventory si2
          WHERE si2.part_id = p.id AND si2.status = 'active') AS store_count
      FROM parts p
      JOIN catalog_categories cc ON cc.id = p.catalog_category_id AND cc.deleted_at IS NULL
      JOIN catalog_types ct ON ct.id = cc.catalog_type_id
      LEFT JOIN part_types pt ON pt.id = p.part_type_id
      LEFT JOIN part_compatible_models pcm ON pcm.part_id = p.id
      ${where}
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx}
    `;
    params.push(limit, offset);

    const { rows } = await db.query(sql, params);

    const { rows: countRows } = await db.query(`
      SELECT COUNT(DISTINCT p.id)::int AS total
      FROM parts p
      JOIN catalog_categories cc ON cc.id = p.catalog_category_id AND cc.deleted_at IS NULL
      JOIN catalog_types ct ON ct.id = cc.catalog_type_id
      LEFT JOIN part_compatible_models pcm ON pcm.part_id = p.id
      ${where}
    `, params.slice(0, idx - 2));

    return { rows, total: (countRows[0] as any)?.total ?? 0 };
  }

  async getCatalogPartById(id: number) {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT p.*, cc.title AS category_name, cc.slug AS category_slug,
        cc.path AS category_path, cc.depth AS category_depth, cc.catalog_type_id,
        ct.slug AS catalog_slug, ct.label AS catalog_label,
        pt.label AS part_type_label, pt.slug AS part_type_slug,
        pt.color AS part_type_color, pt.icon AS part_type_icon
      FROM parts p
      JOIN catalog_categories cc ON cc.id = p.catalog_category_id
      JOIN catalog_types ct ON ct.id = cc.catalog_type_id
      LEFT JOIN part_types pt ON pt.id = p.part_type_id
      WHERE p.id = $1 AND cc.deleted_at IS NULL
    `, [id]);
    if (!rows[0]) return null;
    const part = rows[0] as any;

    const { rows: specs } = await db.query(
      'SELECT catalog_type_id, specs FROM part_specs WHERE part_id = $1',
      [id]
    );
    part.specs = specs;

    const { rows: stores } = await db.query(`
      SELECT si.id AS inventory_id, si.price, si.stock_count, si.status AS stock_status,
             sp.store_name, sp.store_slug, sp.logo, u.id AS store_user_id
      FROM store_inventory si
      JOIN store_profiles sp ON sp.user_id = si.store_id AND sp.status = 'approved'
      JOIN users u ON u.id = si.store_id
      WHERE si.part_id = $1 AND si.status = 'active'
      ORDER BY si.price ASC
    `, [id]);
    part.stores = stores;

    const { rows: compatible } = await db.query(`
      SELECT pcm.*, b.name AS brand_name, b.slug AS brand_slug, vm.name AS model_name
      FROM part_compatible_models pcm
      LEFT JOIN brands b ON b.id = pcm.brand_id
      LEFT JOIN vehicle_models vm ON vm.id = pcm.model_id
      WHERE pcm.part_id = $1
    `, [id]);
    part.compatible_models = compatible;

    return part;
  }

  async adminSetPartSpecs(partId: number, catalogTypeId: number, specs: any) {
    const db = await getDb();
    const { rows } = await db.query(`
      INSERT INTO part_specs (part_id, catalog_type_id, specs)
      VALUES ($1, $2, $3)
      ON CONFLICT (part_id, catalog_type_id)
      DO UPDATE SET specs = EXCLUDED.specs, updated_at = NOW()
      RETURNING *
    `, [partId, catalogTypeId, JSON.stringify(specs)]);
    return rows[0];
  }

  async adminListCatalogCategories(catalogSlug?: string) {
    const db = await getDb();
    const conditions: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (catalogSlug) {
      conditions.push(`ct.slug = $${idx++}`);
      params.push(catalogSlug);
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const { rows } = await db.query(`
      SELECT cc.*, ct.slug AS catalog_slug,
        (SELECT COUNT(*)::int FROM parts p WHERE p.catalog_category_id = cc.id) AS part_count
      FROM catalog_categories cc
      JOIN catalog_types ct ON ct.id = cc.catalog_type_id
      ${where}
      ORDER BY ct.sort_order, cc.sort_order, cc.title
    `, params);
    const map = new Map<number, any>();
    const roots: any[] = [];
    for (const r of rows as any[]) {
      r.children = [];
      map.set(r.id, r);
    }
    for (const r of rows as any[]) {
      if (r.parent_id && map.has(r.parent_id)) {
        map.get(r.parent_id).children.push(r);
      } else if (!r.parent_id) {
        roots.push(r);
      }
    }
    return roots;
  }

  async adminCreateCatalogCategory(data: {
    catalogSlug: string;
    parentId?: number | null;
    slug: string;
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    icon?: string;
    sortOrder?: number;
  }) {
    const db = await getDb();
    const typeId = await this.getCatalogTypeId(db, data.catalogSlug);
    if (!typeId) throw new Error('catalog type not found');
    const { rows } = await db.query(`
      INSERT INTO catalog_categories (catalog_type_id, parent_id, slug, title,
        title_en, description, description_en, icon, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [typeId, data.parentId ?? null, data.slug, data.title,
        data.titleEn || '', data.description || '', data.descriptionEn || '',
        data.icon || '', data.sortOrder ?? 1000]);
    return rows[0];
  }

  async adminUpdateCatalogCategory(id: number, data: Record<string, any>) {
    const db = await getDb();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'catalogSlug') {
        fields.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    if (!fields.length) throw new Error('No fields to update');
    values.push(id);
    const { rows } = await db.query(
      `UPDATE catalog_categories SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return rows[0];
  }

  async adminDeleteCatalogCategory(id: number) {
    const db = await getDb();
    const { rows } = await db.query(`
      UPDATE catalog_categories SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  }

  async adminRestoreCatalogCategory(id: number) {
    const db = await getDb();
    const { rows } = await db.query(`
      UPDATE catalog_categories SET deleted_at = NULL, updated_at = NOW()
      WHERE id = $1 RETURNING *
    `, [id]);
    return rows[0];
  }

  // Admin: read-only lookups (Configuration — no CRUD, ADR-011)
  async adminListPartTypes() {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT id, slug, label, icon, color, sort_order, is_active
      FROM part_types ORDER BY sort_order, slug
    `);
    return rows;
  }

  async adminListCatalogTypes() {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT id, slug, label, icon, color, sort_order, is_active, is_public
      FROM catalog_types ORDER BY sort_order, slug
    `);
    return rows;
  }
}

export const partsService = new PartsService();
