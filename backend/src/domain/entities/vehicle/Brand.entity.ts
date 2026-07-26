import { Slug } from '../value-objects/Slug.js';

export interface BrandSnapshot {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
  logo: string | null;
  country: string | null;
  foundedYear: number | null;
  website: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class Brand {
  private constructor(
    public readonly id: number,
    public name: string,
    public nameEn: string | null,
    public slug: Slug,
    public logo: string | null,
    public country: string | null,
    public foundedYear: number | null,
    public website: string | null,
    public description: string | null,
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(props: {
    id: number; name: string; nameEn?: string | null;
    slug?: string; logo?: string | null; country?: string | null;
    foundedYear?: number | null; website?: string | null; description?: string | null;
  }): Brand {
    return new Brand(
      props.id, props.name, props.nameEn ?? null,
      props.slug ? Slug.from(props.slug) : Slug.generate(props.name),
      props.logo ?? null, props.country ?? null,
      props.foundedYear ?? null, props.website ?? null,
      props.description ?? null, true,
      new Date(), new Date(), null,
    );
  }

  static fromSnapshot(s: BrandSnapshot): Brand {
    return new Brand(
      s.id, s.name, s.nameEn, Slug.from(s.slug),
      s.logo, s.country, s.foundedYear, s.website,
      s.description, s.isActive,
      new Date(s.createdAt), new Date(s.updatedAt),
      s.deletedAt ? new Date(s.deletedAt) : null,
    );
  }

  snapshot(): BrandSnapshot {
    return {
      id: this.id, name: this.name, nameEn: this.nameEn,
      slug: this.slug.value, logo: this.logo,
      country: this.country, foundedYear: this.foundedYear,
      website: this.website, description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }
}
