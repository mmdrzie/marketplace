import { getDb } from '../config/database.js';
import { CategoryRepositoryImpl } from '../domain/infrastructure/category/CategoryRepository.impl.js';

export interface CategoryRow {
  id: number;
  name: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  parent_id: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateCategoryData = {
  name: string;
  name_en?: string;
  slug: string;
  icon?: string;
  parent_id?: number | null;
  sort_order?: number;
};

export type UpdateCategoryData = Partial<CreateCategoryData>;

export class CategoryRepository {
  private _domainImpl: CategoryRepositoryImpl;

  constructor(domainImpl?: CategoryRepositoryImpl) {
    this._domainImpl = domainImpl ?? new CategoryRepositoryImpl();
  }

  async findAll(): Promise<CategoryRow[]> {
    const results = await this._domainImpl.findAll();
    return results.map(r => { const s = r.snapshot(); return { id: s.id, name: s.name, name_en: s.nameEn, slug: s.slug, icon: s.icon, parent_id: s.parentId, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt }; });
  }

  async findBySlug(slug: string): Promise<CategoryRow | undefined> {
    const result = await this._domainImpl.findBySlug(slug);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, name: s.name, name_en: s.nameEn, slug: s.slug, icon: s.icon, parent_id: s.parentId, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt };
  }

  async findById(id: number): Promise<CategoryRow | undefined> {
    const result = await this._domainImpl.findById(id);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, name: s.name, name_en: s.nameEn, slug: s.slug, icon: s.icon, parent_id: s.parentId, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt };
  }

  async findChildren(id: number): Promise<CategoryRow[]> {
    const results = await this._domainImpl.findChildren(id);
    return results.map(r => { const s = r.snapshot(); return { id: s.id, name: s.name, name_en: s.nameEn, slug: s.slug, icon: s.icon, parent_id: s.parentId, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt }; });
  }

  async create(data: CreateCategoryData): Promise<CategoryRow> {
    const result = await this._domainImpl.create(data as Record<string, unknown>);
    const s = result.snapshot();
    return { id: s.id, name: s.name, name_en: s.nameEn, slug: s.slug, icon: s.icon, parent_id: s.parentId, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt };
  }

  async update(id: number, data: UpdateCategoryData): Promise<CategoryRow | undefined> {
    const result = await this._domainImpl.update(id, data as Record<string, unknown>);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, name: s.name, name_en: s.nameEn, slug: s.slug, icon: s.icon, parent_id: s.parentId, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt };
  }

  async delete(id: number): Promise<void> {
    await this._domainImpl.delete(id);
  }
}

export const categoryRepo = new CategoryRepository();
