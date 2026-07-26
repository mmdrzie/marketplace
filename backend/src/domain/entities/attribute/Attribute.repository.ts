import { Attribute } from './Attribute.entity.js';

export interface AttributeRepository {
  findByCategory(categoryId: number): Promise<Attribute[]>;
  findById(id: number): Promise<Attribute | null>;
  create(data: Record<string, unknown>): Promise<Attribute>;
  update(id: number, data: Record<string, unknown>): Promise<Attribute | undefined>;
  delete(id: number): Promise<void>;
}
