export interface AttributeSnapshot {
  id: number;
  categoryId: number;
  name: string;
  label: string;
  type: string;
  options: unknown | null;
  unit: string | null;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export class Attribute {
  private constructor(
    public readonly id: number,
    public readonly categoryId: number,
    public readonly name: string,
    public readonly label: string,
    public readonly type: string,
    public readonly options: unknown | null,
    public readonly unit: string | null,
    public readonly isRequired: boolean,
    public readonly isFilterable: boolean,
    public readonly sortOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromSnapshot(s: AttributeSnapshot): Attribute {
    return new Attribute(s.id, s.categoryId, s.name, s.label, s.type, s.options, s.unit, s.isRequired, s.isFilterable, s.sortOrder, new Date(s.createdAt), new Date(s.updatedAt));
  }

  snapshot(): AttributeSnapshot {
    return { id: this.id, categoryId: this.categoryId, name: this.name, label: this.label, type: this.type, options: this.options, unit: this.unit, isRequired: this.isRequired, isFilterable: this.isFilterable, sortOrder: this.sortOrder, createdAt: this.createdAt.toISOString(), updatedAt: this.updatedAt.toISOString() };
  }
}
