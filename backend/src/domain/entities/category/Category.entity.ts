export interface CategorySnapshot {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
  icon: string | null;
  parentId: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export class Category {
  private constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly nameEn: string | null,
    public readonly slug: string,
    public readonly icon: string | null,
    public readonly parentId: number | null,
    public readonly sortOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromSnapshot(s: CategorySnapshot): Category {
    return new Category(s.id, s.name, s.nameEn, s.slug, s.icon, s.parentId, s.sortOrder, new Date(s.createdAt), new Date(s.updatedAt));
  }

  snapshot(): CategorySnapshot {
    return { id: this.id, name: this.name, nameEn: this.nameEn, slug: this.slug, icon: this.icon, parentId: this.parentId, sortOrder: this.sortOrder, createdAt: this.createdAt.toISOString(), updatedAt: this.updatedAt.toISOString() };
  }
}
