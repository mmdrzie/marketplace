import { Category } from './Category.entity.js';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findBySlug(slug: string): Promise<Category | null>;
  findById(id: number): Promise<Category | null>;
  findChildren(id: number): Promise<Category[]>;
  create(data: Record<string, unknown>): Promise<Category>;
  update(id: number, data: Record<string, unknown>): Promise<Category | undefined>;
  delete(id: number): Promise<void>;
}
