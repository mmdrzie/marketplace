import { Article } from './Article.entity.js';

export interface ArticleRepository {
  findAll(): Promise<Article[]>;
  findBySlug(slug: string): Promise<Article | null>;
  incrementViews(id: number): Promise<void>;
}
