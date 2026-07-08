import { getDb } from '../config/database';

export interface ArticleRow {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_image: string | null;
  category: string | null;
  author: string;
  tags: string[];
  is_pinned: boolean;
  views: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export class ArticleRepository {
  async findAll() {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM articles
       WHERE published_at IS NOT NULL AND deleted_at IS NULL
       ORDER BY is_pinned DESC, published_at DESC`,
    );
    return rows as ArticleRow[];
  }

  async findBySlug(slug: string) {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM articles
       WHERE slug = $1 AND published_at IS NOT NULL AND deleted_at IS NULL`,
      [slug],
    );
    return rows[0] as ArticleRow | undefined;
  }

  async incrementViews(id: number) {
    const db = await getDb();
    await db.query('UPDATE articles SET views = views + 1 WHERE id = $1', [id]);
  }
}

export const articleRepo = new ArticleRepository();
