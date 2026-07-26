export type TenderStatus = 'active' | 'closed' | 'cancelled';

export interface TenderSnapshot {
  id: number;
  userId: string;
  title: string;
  description: string;
  budgetMin: number | null;
  budgetMax: number | null;
  categoryId: number;
  provinceId: number;
  cityId: number;
  status: TenderStatus;
  deadlineAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class Tender {
  private constructor(
    public readonly id: number,
    public readonly userId: string,
    public title: string,
    public description: string,
    public budgetMin: number | null,
    public budgetMax: number | null,
    public categoryId: number,
    public provinceId: number,
    public cityId: number,
    public status: TenderStatus,
    public deadlineAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static fromSnapshot(s: TenderSnapshot): Tender {
    return new Tender(
      s.id, s.userId, s.title, s.description,
      s.budgetMin, s.budgetMax, s.categoryId,
      s.provinceId, s.cityId, s.status,
      s.deadlineAt ? new Date(s.deadlineAt) : null,
      new Date(s.createdAt), new Date(s.updatedAt),
    );
  }

  snapshot(): TenderSnapshot {
    return {
      id: this.id, userId: this.userId, title: this.title,
      description: this.description, budgetMin: this.budgetMin,
      budgetMax: this.budgetMax, categoryId: this.categoryId,
      provinceId: this.provinceId, cityId: this.cityId,
      status: this.status,
      deadlineAt: this.deadlineAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  close(): void {
    if (this.status !== 'active') throw new Error('Only active tenders can be closed');
    (this as any).status = 'closed';
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this.status !== 'active') throw new Error('Only active tenders can be cancelled');
    (this as any).status = 'cancelled';
    this.updatedAt = new Date();
  }
}
