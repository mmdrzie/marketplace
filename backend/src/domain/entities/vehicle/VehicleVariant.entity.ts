import { Slug } from '../value-objects/Slug.js';

export interface VehicleVariantSnapshot {
  id: number;
  modelId: number;
  name: string;
  nameEn: string | null;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class VehicleVariant {
  private constructor(
    public readonly id: number,
    public readonly modelId: number,
    public name: string,
    public nameEn: string | null,
    public slug: Slug,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(props: {
    id: number; modelId: number; name: string; nameEn?: string | null; slug?: string;
  }): VehicleVariant {
    return new VehicleVariant(
      props.id, props.modelId, props.name, props.nameEn ?? null,
      props.slug ? Slug.from(props.slug) : Slug.generate(props.name),
      true, new Date(), new Date(), null,
    );
  }

  static fromSnapshot(s: VehicleVariantSnapshot): VehicleVariant {
    return new VehicleVariant(
      s.id, s.modelId, s.name, s.nameEn, Slug.from(s.slug),
      s.isActive, new Date(s.createdAt), new Date(s.updatedAt),
      s.deletedAt ? new Date(s.deletedAt) : null,
    );
  }

  snapshot(): VehicleVariantSnapshot {
    return {
      id: this.id, modelId: this.modelId,
      name: this.name, nameEn: this.nameEn, slug: this.slug.value,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }
}
