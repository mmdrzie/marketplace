import { TaxonomyNode } from './TaxonomyNode.entity.js';

export interface TaxonomyRepository {
  findById(id: number): Promise<TaxonomyNode | null>;
  findBySlug(slug: string, nodeType?: string): Promise<TaxonomyNode | null>;
  findChildren(parentId: number): Promise<TaxonomyNode[]>;
  findTree(nodeType: string): Promise<TaxonomyNode[]>;
  save(node: TaxonomyNode): Promise<void>;
}
