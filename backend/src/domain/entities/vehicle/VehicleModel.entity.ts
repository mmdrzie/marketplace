import { Slug } from '../value-objects/Slug.js';

export interface VehicleModelSnapshot {
  id: number;
  brandId: number;
  name: string;
  nameEn: string | null;
  slug: string;
  segment: string | null;
  generation: string | null;
  bodyType: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class VehicleModel {
  private constructor(
    public readonly id: number,
    public readonly brandId: number,
    public name: string,
    public nameEn: string | null,
    public slug: Slug,
    public segment: string | null,
    public generation: string | null,
    public bodyType: string | null,
    public yearFrom: number | null,
    public yearTo: number | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(props: {
    id: number; brandId: number; name: string; nameEn?: string | null;
    slug?: string; segment?: string | null; generation?: string | null;
    bodyType?: string | null; yearFrom?: number | null; yearTo?: number | null;
  }): VehicleModel {
    return new VehicleModel(
      props.id, props.brandId, props.name, props.nameEn ?? null,
      props.slug ? Slug.from(props.slug) : Slug.generate(props.name),
      props.segment ?? null, props.generation ?? null,
      props.bodyType ?? null, props.yearFrom ?? null,
      props.yearTo ?? null, true,
      new Date(), new Date(), null,
    );
  }

  static fromSnapshot(s: VehicleModelSnapshot): VehicleModel {
    return new VehicleModel(
      s.id, s.brandId, s.name, s.nameEn, Slug.from(s.slug),
      s.segment, s.generation, s.bodyType,
      s.yearFrom, s.yearTo, s.isActive,
      new Date(s.createdAt), new Date(s.updatedAt),
      s.deletedAt ? new Date(s.deletedAt) : null,
    );
  }

  snapshot(): VehicleModelSnapshot {
    return {
      id: this.id, brandId: this.brandId,
      name: this.name, nameEn: this.nameEn, slug: this.slug.value,
      segment: this.segment, generation: this.generation,
      bodyType: this.bodyType, yearFrom: this.yearFrom, yearTo: this.yearTo,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }
}
