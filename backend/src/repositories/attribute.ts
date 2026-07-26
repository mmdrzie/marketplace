import { getDb } from '../config/database.js';
import { AttributeRepositoryImpl } from '../domain/infrastructure/attribute/AttributeRepository.impl.js';

export interface AttributeRow {
  id: number;
  category_id: number;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean' | 'range' | 'color';
  options: unknown | null;
  unit: string | null;
  is_required: boolean;
  is_filterable: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type CreateAttributeData = {
  category_id: number;
  name: string;
  label: string;
  type: string;
  options?: unknown;
  unit?: string;
  is_required?: boolean;
  is_filterable?: boolean;
  sort_order?: number;
};

export type UpdateAttributeData = Partial<Omit<CreateAttributeData, 'category_id'>>;

export class AttributeRepository {
  private _domainImpl: AttributeRepositoryImpl;

  constructor(domainImpl?: AttributeRepositoryImpl) {
    this._domainImpl = domainImpl ?? new AttributeRepositoryImpl();
  }

  async findByCategory(categoryId: number): Promise<AttributeRow[]> {
    const results = await this._domainImpl.findByCategory(categoryId);
    return results.map(a => { const s = a.snapshot(); return { id: s.id, category_id: s.categoryId, name: s.name, label: s.label, type: s.type as AttributeRow['type'], options: s.options, unit: s.unit, is_required: s.isRequired, is_filterable: s.isFilterable, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt }; });
  }

  async findById(id: number): Promise<AttributeRow | undefined> {
    const result = await this._domainImpl.findById(id);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, category_id: s.categoryId, name: s.name, label: s.label, type: s.type as AttributeRow['type'], options: s.options, unit: s.unit, is_required: s.isRequired, is_filterable: s.isFilterable, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt };
  }

  async create(data: CreateAttributeData): Promise<AttributeRow> {
    const result = await this._domainImpl.create(data as Record<string, unknown>);
    const s = result.snapshot();
    return { id: s.id, category_id: s.categoryId, name: s.name, label: s.label, type: s.type as AttributeRow['type'], options: s.options, unit: s.unit, is_required: s.isRequired, is_filterable: s.isFilterable, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt };
  }

  async update(id: number, data: UpdateAttributeData): Promise<AttributeRow | undefined> {
    const result = await this._domainImpl.update(id, data as Record<string, unknown>);
    if (!result) return undefined;
    const s = result.snapshot();
    return { id: s.id, category_id: s.categoryId, name: s.name, label: s.label, type: s.type as AttributeRow['type'], options: s.options, unit: s.unit, is_required: s.isRequired, is_filterable: s.isFilterable, sort_order: s.sortOrder, created_at: s.createdAt, updated_at: s.updatedAt };
  }

  async delete(id: number): Promise<void> {
    await this._domainImpl.delete(id);
  }
}

export const attributeRepo = new AttributeRepository();
