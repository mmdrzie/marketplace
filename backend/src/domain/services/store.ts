import { getDb } from '../../config/database.js';
import { AppError } from '../../errors.js';
import type { AuthUser } from '../../middleware/auth.js';

interface InventoryItem {
  id: number;
  store_id: string;
  part_id: number;
  price: number;
  stock_count: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  notes: string;
  created_at: string;
  updated_at: string;
}

interface InventoryWithPart extends InventoryItem {
  part_name: string;
  part_number: string;
  part_image: string;
  category_label: string;
  compatibility: string;
  manufacturer: string;
}

type DbRow = Record<string, unknown>;

export class StoreService {
  async addInventory(input: {
    user: AuthUser;
    partId: number;
    price: number;
    stockCount: number;
    notes?: string;
  }): Promise<InventoryItem> {
    const db = await getDb();

    const part = await db.query('SELECT id FROM parts WHERE id = $1', [input.partId]);
    if (!part.rows[0]) throw AppError.notFound('Part not found');

    const existing = await db.query(
      'SELECT id FROM store_inventory WHERE store_id = $1 AND part_id = $2',
      [input.user.id, input.partId],
    );
    if (existing.rows[0]) throw AppError.resourceConflict('This part is already in your inventory');

    const { rows } = await db.query(
      `INSERT INTO store_inventory (store_id, part_id, price, stock_count, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING *`,
      [input.user.id, input.partId, input.price, input.stockCount, input.notes || ''],
    );
    return rows[0] as unknown as InventoryItem;
  }

  async updateInventory(input: {
    user: AuthUser;
    id: number;
    price?: number;
    stockCount?: number;
    status?: 'active' | 'inactive' | 'out_of_stock';
    notes?: string;
  }): Promise<InventoryItem> {
    const db = await getDb();
    const existing = await db.query(
      'SELECT * FROM store_inventory WHERE id = $1 AND store_id = $2',
      [input.id, input.user.id],
    );
    const row = existing.rows[0] as DbRow | undefined;
    if (!row) throw AppError.notFound('Inventory item not found');

    const price = input.price ?? (row.price as number);
    const stockCount = input.stockCount ?? (row.stock_count as number);
    const status = input.status ?? (row.status as string);
    const notes = input.notes ?? (row.notes as string);

    const { rows } = await db.query(
      `UPDATE store_inventory SET price = $1, stock_count = $2, status = $3, notes = $4, updated_at = NOW()
       WHERE id = $5 AND store_id = $6
       RETURNING *`,
      [price, stockCount, status, notes, input.id, input.user.id],
    );
    return rows[0] as unknown as InventoryItem;
  }

  async deleteInventory(user: AuthUser, id: number): Promise<void> {
    const db = await getDb();
    const { rowCount } = await db.query(
      'DELETE FROM store_inventory WHERE id = $1 AND store_id = $2',
      [id, user.id],
    );
    if (!rowCount) throw AppError.notFound('Inventory item not found');
  }

  async listInventory(user: AuthUser, status?: string): Promise<InventoryWithPart[]> {
    const db = await getDb();
    let sql = `
      SELECT si.*, p.name AS part_name, p.part_number, p.image AS part_image,
             p.category_label, p.compatibility, p.manufacturer
      FROM store_inventory si
      JOIN parts p ON p.id = si.part_id
      WHERE si.store_id = $1
    `;
    const params: unknown[] = [user.id];
    if (status) {
      sql += ' AND si.status = $2';
      params.push(status);
    }
    sql += ' ORDER BY si.updated_at DESC';
    const { rows } = await db.query(sql, params);
    return rows as unknown as InventoryWithPart[];
  }

  async getInventoryStats(user: AuthUser): Promise<{
    total_items: number;
    active_items: number;
    out_of_stock: number;
    total_stock: number;
  }> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT
        COUNT(*) AS total_items,
        COUNT(*) FILTER (WHERE status = 'active') AS active_items,
        COUNT(*) FILTER (WHERE status = 'out_of_stock') AS out_of_stock,
        COALESCE(SUM(stock_count), 0) AS total_stock
      FROM store_inventory WHERE store_id = $1`,
      [user.id],
    );
    return rows[0] as unknown as { total_items: number; active_items: number; out_of_stock: number; total_stock: number };
  }
}

export const storeService = new StoreService();
