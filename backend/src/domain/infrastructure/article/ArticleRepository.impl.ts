import { getDb } from '../../../config/database.js';
import { Article } from '../../entities/article/Article.entity.js';
import type { ArticleRepository } from '../../entities/article/Article.repository.js';

export class ArticleRepositoryImpl implements ArticleRepository {
  async findAll(): Promise<Article[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM articles WHERE published_at IS NOT NULL AND deleted_at IS NULL ORDER BY is_pinned DESC, published_at DESC`,
    );
    return (rows as Record<string, unknown>[]).map(r => Article.fromSnapshot(this.toSnapshot(r)));
  }

  async findBySlug(slug: string): Promise<Article | null> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM articles WHERE slug = $1 AND published_at IS NOT NULL AND deleted_at IS NULL`,
      [slug],
    );
    if (!rows.length) return null;
    return Article.fromSnapshot(this.toSnapshot(rows[0] as Record<string, unknown>));
  }

  async incrementViews(id: number): Promise<void> {
    const db = await getDb();
    await db.query('UPDATE articles SET views = views + 1 WHERE id = $1', [id]);
  }

  private toSnapshot(r: Record<string, unknown>) {
    return {
      id: r.id as number, title: r.title as string, slug: r.slug as string,
      excerpt: r.excerpt as string, body: r.body as string,
      coverImage: r.cover_image as string | null, category: r.category as string | null,
      author: r.author as string, tags: r.tags as string[],
      isPinned: r.is_pinned as boolean, views: r.views as number,
      readingTime: r.reading_time as number, publishedAt: r.published_at as string | null,
      createdAt: r.created_at as string, updatedAt: r.updated_at as string,
      deletedAt: r.deleted_at as string | null,
    };
  }
}
