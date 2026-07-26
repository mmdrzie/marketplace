import { getDb } from '../../../config/database.js';
import { Tender } from '../../entities/tender/Tender.entity.js';
import type { TenderRepository } from '../../entities/tender/Tender.repository.js';

export class TenderRepositoryImpl implements TenderRepository {
  async findById(id: number): Promise<Tender | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM tenders WHERE id = $1', [id]);
    if (!rows.length) return null;
    return Tender.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findAll(filters?: { status?: string; userId?: string }): Promise<Tender[]> {
    const db = await getDb();
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (filters?.status) { conditions.push(`status = $${idx++}`); params.push(filters.status); }
    if (filters?.userId) { conditions.push(`user_id = $${idx++}`); params.push(filters.userId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT * FROM tenders ${where} ORDER BY created_at DESC`, params);
    return (rows as Record<string, unknown>[]).map(r => Tender.fromSnapshot(this.toSnapshot(r)));
  }

  async save(tender: Tender): Promise<void> {
    const db = await getDb();
    const s = tender.snapshot();

    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO tenders (user_id, title, description, budget_min, budget_max, category_id, province_id, city_id, status, deadline_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [s.userId, s.title, s.description, s.budgetMin, s.budgetMax, s.categoryId, s.provinceId, s.cityId, s.status, s.deadlineAt],
      );
      (tender as any).id = (rows[0] as Record<string, unknown>).id;
    } else {
      await db.query(
        `UPDATE tenders SET title=$1, description=$2, status=$3, updated_at=NOW() WHERE id=$4`,
        [s.title, s.description, s.status, s.id],
      );
    }
  }

  private toSnapshot(r: Record<string, unknown>) {
    return {
      id: r.id as number, userId: r.user_id as string, title: r.title as string,
      description: r.description as string, budgetMin: r.budget_min as number | null,
      budgetMax: r.budget_max as number | null, categoryId: r.category_id as number,
      provinceId: r.province_id as number, cityId: r.city_id as number,
      status: r.status as 'active' | 'closed' | 'cancelled',
      deadlineAt: r.deadline_at as string | null,
      createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    };
  }
}
