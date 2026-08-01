import { getDb } from '../../../config/database.js';
import { Content } from '../../entities/content/Content.entity.js';
import type { ContentRepository, ContentFilter, CreateContentData, UpdateContentData } from '../../entities/content/Content.repository.js';

const CONTENT_COLUMNS = `
  a.id, a.title, a.slug, a.excerpt, a.body, a.cover_image,
  a.is_pinned, a.views, a.reading_time, a.difficulty,
  a.meta_title, a.meta_description, a.canonical_url, a.og_image, a.robots, a.extra_seo,
  a.published_at, a.scheduled_at, a.created_at, a.updated_at, a.deleted_at,
  a.status, a.content_type_id, a.category_id, a.author_id
`;

const TYPE_COLUMNS = `ct.id AS ct_id, ct.slug AS ct_slug, ct.label AS ct_label, ct.icon AS ct_icon, ct.color AS ct_color`;
const CAT_COLUMNS = `cc.id AS cc_id, cc.slug AS cc_slug, cc.title AS cc_title, cc.path AS cc_path, cc.parent_id AS cc_parent_id`;
const USER_COLUMNS = `u.id AS u_id, u.name AS u_name`;

function typeJoin() { return 'LEFT JOIN content_types ct ON a.content_type_id = ct.id'; }
function catJoin() { return 'LEFT JOIN content_categories cc ON a.category_id = cc.id'; }
function userJoin() { return 'LEFT JOIN users u ON a.author_id = u.id'; }

export class ContentRepositoryImpl implements ContentRepository {
  private async fetchTags(contentId: number): Promise<{ id: number; slug: string; label: string }[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT t.id, t.slug, t.label FROM content_tag_map tm JOIN content_tags t ON tm.tag_id = t.id WHERE tm.content_id = $1 ORDER BY t.label`,
      [contentId],
    );
    return (rows as Record<string, unknown>[]).map(r => ({
      id: r.id as number, slug: r.slug as string, label: r.label as string,
    }));
  }

  private async fetchLinks(contentId: number): Promise<{ entityType: string; entityId: number; label: string | null }[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT entity_type, entity_id, label FROM content_links WHERE content_id = $1 ORDER BY sort_order`,
      [contentId],
    );
    return (rows as Record<string, unknown>[]).map(r => ({
      entityType: r.entity_type as string, entityId: r.entity_id as number, label: r.label as string | null,
    }));
  }

  private async fetchRelatedIds(contentId: number): Promise<number[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT related_content_id FROM content_relations WHERE content_id = $1
       UNION SELECT content_id FROM content_relations WHERE related_content_id = $1`,
      [contentId],
    );
    return (rows as Record<string, unknown>[]).map(r => (r.related_content_id ?? r.content_id) as number);
  }

  private rowToSnapshot(r: Record<string, unknown>): Record<string, unknown> {
    return {
      id: r.id, title: r.title, slug: r.slug,
      excerpt: r.excerpt, body: r.body, coverImage: r.cover_image,
      contentType: {
        id: r.ct_id, slug: r.ct_slug, label: r.ct_label,
        icon: r.ct_icon ?? null, color: r.ct_color ?? null,
      },
      category: r.cc_id ? {
        id: r.cc_id, slug: r.cc_slug, title: r.cc_title,
        path: r.cc_path ?? null, parentId: r.cc_parent_id ?? null,
      } : null,
      author: r.u_id ? { id: r.u_id as string, name: r.u_name as string } : null,
      status: r.status,
      tags: [] as { id: number; slug: string; label: string }[],
      links: [] as { entityType: string; entityId: number; label: string | null }[],
      relatedContentIds: [] as number[],
      isPinned: r.is_pinned, views: r.views, readingTime: r.reading_time,
      difficulty: r.difficulty ?? null,
      metaTitle: r.meta_title ?? null, metaDescription: r.meta_description ?? null,
      canonicalUrl: r.canonical_url ?? null, ogImage: r.og_image ?? null,
      robots: r.robots ?? null, extraSeo: r.extra_seo ?? {},
      publishedAt: r.published_at ?? null, scheduledAt: r.scheduled_at ?? null,
      createdAt: r.created_at, updatedAt: r.updated_at, deletedAt: r.deleted_at ?? null,
    };
  }

  private async enrich(snapshot: Record<string, unknown>, id: number): Promise<Record<string, unknown>> {
    const [tags, links, relatedIds] = await Promise.all([
      this.fetchTags(id), this.fetchLinks(id), this.fetchRelatedIds(id),
    ]);
    snapshot.tags = tags;
    snapshot.links = links;
    snapshot.relatedContentIds = relatedIds;
    return snapshot;
  }

  private async enrichMany(snapshots: Record<string, unknown>[]): Promise<Record<string, unknown>[]> {
    if (!snapshots.length) return [];
    const ids = snapshots.map(s => s.id as number);
    const db = await getDb();

    const [tagRows, linkRows, relRows] = await Promise.all([
      db.query(
        `SELECT tm.content_id, t.id, t.slug, t.label FROM content_tag_map tm JOIN content_tags t ON tm.tag_id = t.id WHERE tm.content_id = ANY($1::bigint[])`,
        [ids],
      ),
      db.query(
        `SELECT content_id, entity_type, entity_id, label FROM content_links WHERE content_id = ANY($1::bigint[]) ORDER BY sort_order`,
        [ids],
      ),
      db.query(
        `SELECT content_id, related_content_id FROM content_relations WHERE content_id = ANY($1::bigint[])
         UNION SELECT related_content_id AS content_id, content_id AS related_content_id FROM content_relations WHERE related_content_id = ANY($1::bigint[])`,
        [ids],
      ),
    ]);

    const tagMap = new Map<number, { id: number; slug: string; label: string }[]>();
    for (const row of tagRows.rows as Record<string, unknown>[]) {
      const cid = row.content_id as number;
      if (!tagMap.has(cid)) tagMap.set(cid, []);
      tagMap.get(cid)!.push({ id: row.id as number, slug: row.slug as string, label: row.label as string });
    }

    const linkMap = new Map<number, { entityType: string; entityId: number; label: string | null }[]>();
    for (const row of linkRows.rows as Record<string, unknown>[]) {
      const cid = row.content_id as number;
      if (!linkMap.has(cid)) linkMap.set(cid, []);
      linkMap.get(cid)!.push({ entityType: row.entity_type as string, entityId: row.entity_id as number, label: row.label as string | null });
    }

    const relMap = new Map<number, number[]>();
    for (const row of relRows.rows as Record<string, unknown>[]) {
      const cid = row.content_id as number;
      if (!relMap.has(cid)) relMap.set(cid, []);
      relMap.get(cid)!.push(row.related_content_id as number);
    }

    for (const s of snapshots) {
      s.tags = tagMap.get(s.id as number) ?? [];
      s.links = linkMap.get(s.id as number) ?? [];
      s.relatedContentIds = relMap.get(s.id as number) ?? [];
    }
    return snapshots;
  }

  private async queryAll(sql: string, params: unknown[]): Promise<Content[]> {
    const db = await getDb();
    const { rows } = await db.query(sql, params);
    const snapshots = await this.enrichMany((rows as Record<string, unknown>[]).map(r => this.rowToSnapshot(r)));
    return snapshots.map(s => Content.fromSnapshot(s as any));
  }

  private async queryOne(sql: string, params: unknown[]): Promise<Content | null> {
    const db = await getDb();
    const { rows } = await db.query(sql, params);
    const r = rows as Record<string, unknown>[];
    if (!r.length) return null;
    const snapshot = await this.enrich(this.rowToSnapshot(r[0]), r[0].id as number);
    return Content.fromSnapshot(snapshot as any);
  }

  async findAll(filter?: ContentFilter): Promise<Content[]> {
    const conditions = ['a.deleted_at IS NULL'];
    const params: unknown[] = [];
    let idx = 1;

    if (filter?.type) { conditions.push(`ct.slug = $${idx++}`); params.push(filter.type); }
    if (filter?.categoryId) {
      conditions.push(
        `(a.category_id = $${idx} OR cc.path LIKE (SELECT COALESCE(path, '') || '/' FROM content_categories WHERE id = $${idx}) || '%')`,
      );
      params.push(filter.categoryId);
      idx++;
    }
    if (filter?.tagSlug) {
      conditions.push(`EXISTS (SELECT 1 FROM content_tag_map tm2 JOIN content_tags t2 ON tm2.tag_id = t2.id WHERE tm2.content_id = a.id AND t2.slug = $${idx++})`);
      params.push(filter.tagSlug);
    }
    if (filter?.status) { conditions.push(`a.status = $${idx++}`); params.push(filter.status); }
    else { conditions.push(`a.status = 'published'`); }
    if (filter?.search) {
      conditions.push(`(a.title ILIKE $${idx} OR a.excerpt ILIKE $${idx} OR a.body ILIKE $${idx})`);
      params.push(`%${filter.search}%`);
      idx++;
    }

    const limit = filter?.limit ? ` LIMIT ${filter.limit}` : '';
    const offset = filter?.offset ? ` OFFSET ${filter.offset}` : '';
    const sql = `SELECT ${CONTENT_COLUMNS}, ${TYPE_COLUMNS}, ${CAT_COLUMNS}, ${USER_COLUMNS}
      FROM articles a ${typeJoin()} ${catJoin()} ${userJoin()}
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.is_pinned DESC, a.published_at DESC NULLS LAST${limit}${offset}`;

    return this.queryAll(sql, params);
  }

  async findBySlug(slug: string): Promise<Content | null> {
    return this.queryOne(
      `SELECT ${CONTENT_COLUMNS}, ${TYPE_COLUMNS}, ${CAT_COLUMNS}, ${USER_COLUMNS}
       FROM articles a ${typeJoin()} ${catJoin()} ${userJoin()}
       WHERE a.slug = $1 AND a.deleted_at IS NULL AND a.status = 'published'`,
      [slug],
    );
  }

  async findById(id: number): Promise<Content | null> {
    return this.queryOne(
      `SELECT ${CONTENT_COLUMNS}, ${TYPE_COLUMNS}, ${CAT_COLUMNS}, ${USER_COLUMNS}
       FROM articles a ${typeJoin()} ${catJoin()} ${userJoin()}
       WHERE a.id = $1 AND a.deleted_at IS NULL`,
      [id],
    );
  }

  async findByEntity(entityType: string, entityId: number): Promise<Content[]> {
    return this.queryAll(
      `SELECT ${CONTENT_COLUMNS}, ${TYPE_COLUMNS}, ${CAT_COLUMNS}, ${USER_COLUMNS}
       FROM articles a ${typeJoin()} ${catJoin()} ${userJoin()}
       WHERE a.deleted_at IS NULL AND a.status = 'published'
         AND EXISTS (SELECT 1 FROM content_links cl WHERE cl.content_id = a.id AND cl.entity_type = $1 AND cl.entity_id = $2)
       ORDER BY a.published_at DESC`,
      [entityType, entityId],
    );
  }

  async findByCategory(categoryId: number): Promise<Content[]> {
    return this.queryAll(
      `SELECT ${CONTENT_COLUMNS}, ${TYPE_COLUMNS}, ${CAT_COLUMNS}, ${USER_COLUMNS}
       FROM articles a ${typeJoin()} ${catJoin()} ${userJoin()}
       WHERE a.deleted_at IS NULL AND a.status = 'published'
         AND (a.category_id = $1 OR cc.path LIKE (SELECT COALESCE(path, '') || '/' FROM content_categories WHERE id = $1) || '%')
       ORDER BY a.published_at DESC`,
      [categoryId],
    );
  }

  async getRelated(contentId: number): Promise<Content[]> {
    return this.queryAll(
      `SELECT ${CONTENT_COLUMNS}, ${TYPE_COLUMNS}, ${CAT_COLUMNS}, ${USER_COLUMNS}
       FROM articles a ${typeJoin()} ${catJoin()} ${userJoin()}
       WHERE a.deleted_at IS NULL AND a.status = 'published' AND a.id <> $1
         AND (a.id IN (SELECT related_content_id FROM content_relations WHERE content_id = $1)
           OR a.id IN (SELECT content_id FROM content_relations WHERE related_content_id = $1))
       ORDER BY a.is_pinned DESC, a.published_at DESC LIMIT 6`,
      [contentId],
    );
  }

  async create(data: CreateContentData): Promise<Record<string, unknown>> {
    const db = await getDb();
    const now = new Date().toISOString();
    const { rows } = await db.query(
      `INSERT INTO articles (title, slug, excerpt, body, cover_image, content_type_id, category_id, author_id, status, is_pinned, reading_time, difficulty, meta_title, meta_description, canonical_url, og_image, robots, extra_seo, published_at, scheduled_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING id`,
      [
        data.title, data.slug, data.excerpt ?? '', data.body ?? '',
        data.coverImage ?? null, data.contentTypeId, data.categoryId ?? null,
        data.authorId ?? null, data.status ?? 'draft', data.isPinned ?? false,
        data.readingTime ?? 1, data.difficulty ?? null,
        data.metaTitle ?? null, data.metaDescription ?? null,
        data.canonicalUrl ?? null, data.ogImage ?? null,
        data.robots ?? 'index,follow', data.extraSeo ?? {},
        data.publishedAt ?? (data.status === 'published' ? now : null),
        data.scheduledAt ?? null, now, now,
      ],
    );
    const id = (rows as Record<string, unknown>[])[0].id as number;

    if (data.tags && data.tags.length > 0) { await this.addTags(id, data.tags); }
    if (data.links && data.links.length > 0) {
      for (const link of data.links) await this.addLink(id, link.entityType, link.entityId, link.label);
    }

    const created = await this.findById(id);
    return (created!.snapshot() as unknown) as Record<string, unknown>;
  }

  async update(id: number, data: UpdateContentData): Promise<Record<string, unknown>> {
    const db = await getDb();
    const sets: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      sets.push(`${key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)} = $${idx++}`);
      params.push(value);
    }
    if (!sets.length) { const existing = await this.findById(id); return (existing!.snapshot() as unknown) as Record<string, unknown>; }

    sets.push(`updated_at = $${idx++}`);
    params.push(new Date().toISOString());
    params.push(id);

    await db.query(`UPDATE articles SET ${sets.join(', ')} WHERE id = $${idx}`, params);
    const updated = await this.findById(id);
    return (updated!.snapshot() as unknown) as Record<string, unknown>;
  }

  async softDelete(id: number): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE articles SET deleted_at = $1, updated_at = $1 WHERE id = $2', [new Date().toISOString(), id]);
  }

  async incrementViews(id: number): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE articles SET views = views + 1 WHERE id = $1', [id]);
  }

  async getBookmarks(userId: string): Promise<Content[]> {
    return this.queryAll(
      `SELECT ${CONTENT_COLUMNS}, ${TYPE_COLUMNS}, ${CAT_COLUMNS}, ${USER_COLUMNS}
       FROM articles a ${typeJoin()} ${catJoin()} ${userJoin()}
       WHERE a.deleted_at IS NULL AND a.status = 'published'
         AND a.id IN (SELECT content_id FROM user_saved_contents WHERE user_id = $1)
       ORDER BY a.published_at DESC`,
      [userId],
    );
  }

  async addBookmark(userId: string, contentId: number): Promise<void> {
    const db = await getDb();
    await db.query('INSERT INTO user_saved_contents (user_id, content_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, contentId]);
  }

  async removeBookmark(userId: string, contentId: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM user_saved_contents WHERE user_id = $1 AND content_id = $2', [userId, contentId]);
  }

  async isBookmarked(userId: string, contentId: number): Promise<boolean> {
    const db = await getDb();
    const { rows } = await db.query('SELECT 1 FROM user_saved_contents WHERE user_id = $1 AND content_id = $2', [userId, contentId]);
    return rows.length > 0;
  }

  async addRelation(contentId: number, relatedId: number, type = 'related'): Promise<void> {
    const db = await getDb();
    await db.query('INSERT INTO content_relations (content_id, related_content_id, relation_type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [contentId, relatedId, type]);
    await db.query('INSERT INTO content_relations (content_id, related_content_id, relation_type) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [relatedId, contentId, type]);
  }

  async removeRelation(contentId: number, relatedId: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM content_relations WHERE (content_id = $1 AND related_content_id = $2) OR (content_id = $2 AND related_content_id = $1)', [contentId, relatedId]);
  }

  async addLink(contentId: number, entityType: string, entityId: number, label?: string): Promise<void> {
    const db = await getDb();
    await db.query('INSERT INTO content_links (content_id, entity_type, entity_id, label) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [contentId, entityType, entityId, label ?? null]);
  }

  async removeLink(contentId: number, entityType: string, entityId: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM content_links WHERE content_id = $1 AND entity_type = $2 AND entity_id = $3', [contentId, entityType, entityId]);
  }

  async addTags(contentId: number, tags: { slug: string; label: string }[]): Promise<void> {
    const db = await getDb();
    for (const tag of tags) {
      const { rows } = await db.query('INSERT INTO content_tags (slug, label) VALUES ($1, $2) ON CONFLICT (slug) DO UPDATE SET label = EXCLUDED.label RETURNING id', [tag.slug, tag.label]);
      await db.query('INSERT INTO content_tag_map (content_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [contentId, (rows as Record<string, unknown>[])[0].id]);
    }
  }

  async clearTags(contentId: number): Promise<void> {
    const db = await getDb();
    await db.query('DELETE FROM content_tag_map WHERE content_id = $1', [contentId]);
  }

  async getContentTypes(): Promise<{ id: number; slug: string; label: string; icon: string | null; color: string | null }[]> {
    const db = await getDb();
    const { rows } = await db.query('SELECT id, slug, label, icon, color FROM content_types ORDER BY sort_order');
    return rows as { id: number; slug: string; label: string; icon: string | null; color: string | null }[];
  }

  async getCategories(parentId?: number | null): Promise<{ id: number; parentId: number | null; slug: string; title: string; description: string | null; icon: string | null; path: string | null }[]> {
    const db = await getDb();
    let sql = 'SELECT id, parent_id, slug, title, description, icon, path FROM content_categories';
    const params: unknown[] = [];
    if (parentId !== undefined) {
      sql += parentId === null ? ' WHERE parent_id IS NULL' : ' WHERE parent_id = $1';
      if (parentId !== null) params.push(parentId);
    }
    sql += ' ORDER BY sort_order, title';
    const { rows } = await db.query(sql, params);
    return (rows as Record<string, unknown>[]).map(r => ({
      id: r.id as number, parentId: r.parent_id as number | null,
      slug: r.slug as string, title: r.title as string,
      description: r.description as string | null, icon: r.icon as string | null,
      path: r.path as string | null,
    }));
  }
}