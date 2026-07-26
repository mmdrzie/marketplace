import { getDb } from '../config/database.js';
import { ArticleRepositoryImpl } from '../domain/infrastructure/article/ArticleRepository.impl.js';

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
  private _domainImpl: ArticleRepositoryImpl;

  constructor(domainImpl?: ArticleRepositoryImpl) {
    this._domainImpl = domainImpl ?? new ArticleRepositoryImpl();
  }

  async findAll() {
    const results = await this._domainImpl.findAll();
    return results.map(a => { const s = a.snapshot(); return { id: s.id, title: s.title, slug: s.slug, excerpt: s.excerpt, body: s.body, cover_image: s.coverImage, category: s.category, author: s.author, tags: s.tags, is_pinned: s.isPinned, views: s.views, reading_time: s.readingTime, published_at: s.publishedAt, created_at: s.createdAt, updated_at: s.updatedAt, deleted_at: s.deletedAt }; });
  }

  async findBySlug(slug: string) {
    const result = await this._domainImpl.findBySlug(slug);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, title: s.title, slug: s.slug, excerpt: s.excerpt, body: s.body, cover_image: s.coverImage, category: s.category, author: s.author, tags: s.tags, is_pinned: s.isPinned, views: s.views, reading_time: s.readingTime, published_at: s.publishedAt, created_at: s.createdAt, updated_at: s.updatedAt, deleted_at: s.deletedAt };
  }

  async incrementViews(id: number) {
    await this._domainImpl.incrementViews(id);
  }
}

export const articleRepo = new ArticleRepository();
