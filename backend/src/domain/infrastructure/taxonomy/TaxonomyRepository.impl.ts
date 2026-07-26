import { getDb } from '../../../config/database.js';
import { TaxonomyNode } from '../../entities/taxonomy/TaxonomyNode.entity.js';
import type { TaxonomyRepository } from '../../entities/taxonomy/Taxonomy.repository.js';

export class TaxonomyRepositoryImpl implements TaxonomyRepository {
  async findById(id: number): Promise<TaxonomyNode | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM taxonomy_nodes WHERE id = $1', [id]);
    if (!rows.length) return null;
    return TaxonomyNode.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findBySlug(slug: string, nodeType?: string): Promise<TaxonomyNode | null> {
    const db = await getDb();
    const { rows } = await db.query(
      nodeType
        ? 'SELECT * FROM taxonomy_nodes WHERE slug = $1 AND node_type = $2'
        : 'SELECT * FROM taxonomy_nodes WHERE slug = $1',
      nodeType ? [slug, nodeType] : [slug],
    );
    if (!rows.length) return null;
    return TaxonomyNode.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async findChildren(parentId: number): Promise<TaxonomyNode[]> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM taxonomy_nodes WHERE parent_id = $1 AND is_active = true ORDER BY sort_order, name',
      [parentId],
    );
    return (rows as Record<string, unknown>[]).map(r => TaxonomyNode.fromSnapshot(this.toSnapshot(r)));
  }

  async findTree(nodeType: string): Promise<TaxonomyNode[]> {
    const db = await getDb();
    const { rows } = await db.query(
      'SELECT * FROM taxonomy_nodes WHERE node_type = $1 AND is_active = true ORDER BY path, sort_order',
      [nodeType],
    );
    return (rows as Record<string, unknown>[]).map(r => TaxonomyNode.fromSnapshot(this.toSnapshot(r)));
  }

  async save(node: TaxonomyNode): Promise<void> {
    const db = await getDb();
    const s = node.snapshot();

    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO taxonomy_nodes (node_type, slug, name, name_en, parent_id, path, depth, ref_id, visibility, sort_order, icon, seo_title, seo_description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
        [s.nodeType, s.slug, s.name, s.nameEn, s.parentId, s.path, s.depth, s.refId, s.visibility, s.sortOrder, s.icon, s.seoTitle, s.seoDescription],
      );
      (node as any).id = (rows[0] as Record<string, unknown>).id;
    } else {
      await db.query(
        `UPDATE taxonomy_nodes SET name=$1, name_en=$2, slug=$3, path=$4, depth=$5,
         is_active=$6, visibility=$7, sort_order=$8, icon=$9, seo_title=$10, seo_description=$11, updated_at=NOW()
         WHERE id=$12`,
        [s.name, s.nameEn, s.slug, s.path, s.depth, s.isActive, s.visibility, s.sortOrder, s.icon, s.seoTitle, s.seoDescription, s.id],
      );
    }
  }

  private toSnapshot(r: Record<string, unknown>) {
    return {
      id: r.id as number, nodeType: r.node_type as 'category' | 'brand' | 'model' | 'variant',
      slug: r.slug as string, name: r.name as string, nameEn: r.name_en as string | null,
      parentId: r.parent_id as number | null, path: r.path as string | null,
      depth: r.depth as number, refId: r.ref_id as number | null,
      isActive: r.is_active as boolean, visibility: r.visibility as 'PUBLIC' | 'PRIVATE' | 'HIDDEN' | 'ARCHIVED',
      sortOrder: r.sort_order as number, icon: r.icon as string | null,
      seoTitle: r.seo_title as string | null, seoDescription: r.seo_description as string | null,
      createdAt: r.created_at as string, updatedAt: r.updated_at as string,
    };
  }
}
