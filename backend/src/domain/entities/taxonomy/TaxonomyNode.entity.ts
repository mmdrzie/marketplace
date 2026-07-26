export type NodeType = 'category' | 'brand' | 'model' | 'variant';
export type VisibilityLevel = 'PUBLIC' | 'PRIVATE' | 'HIDDEN' | 'ARCHIVED';

export interface TaxonomyNodeSnapshot {
  id: number;
  nodeType: NodeType;
  slug: string;
  name: string;
  nameEn: string | null;
  parentId: number | null;
  path: string | null;
  depth: number;
  refId: number | null;
  isActive: boolean;
  visibility: VisibilityLevel;
  sortOrder: number;
  icon: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export class TaxonomyNode {
  private constructor(
    public readonly id: number,
    public readonly nodeType: NodeType,
    public slug: string,
    public name: string,
    public nameEn: string | null,
    public parentId: number | null,
    public path: string | null,
    public depth: number,
    public refId: number | null,
    public isActive: boolean,
    public visibility: VisibilityLevel,
    public sortOrder: number,
    public icon: string | null,
    public seoTitle: string | null,
    public seoDescription: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static fromSnapshot(s: TaxonomyNodeSnapshot): TaxonomyNode {
    return new TaxonomyNode(
      s.id, s.nodeType, s.slug, s.name, s.nameEn,
      s.parentId, s.path, s.depth, s.refId,
      s.isActive, s.visibility, s.sortOrder,
      s.icon, s.seoTitle, s.seoDescription,
      new Date(s.createdAt), new Date(s.updatedAt),
    );
  }

  snapshot(): TaxonomyNodeSnapshot {
    return {
      id: this.id, nodeType: this.nodeType, slug: this.slug,
      name: this.name, nameEn: this.nameEn, parentId: this.parentId,
      path: this.path, depth: this.depth, refId: this.refId,
      isActive: this.isActive, visibility: this.visibility,
      sortOrder: this.sortOrder, icon: this.icon,
      seoTitle: this.seoTitle, seoDescription: this.seoDescription,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  setVisibility(v: VisibilityLevel): void {
    this.visibility = v;
    this.updatedAt = new Date();
  }
}
