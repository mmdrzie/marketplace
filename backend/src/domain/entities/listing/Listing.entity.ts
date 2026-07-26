import { ListingStatus, canTransition, parseListingStatus } from '../value-objects/ListingStatus.js';
import { PriceType, parsePriceType } from '../value-objects/PriceType.js';
import { Money } from '../value-objects/Money.js';
import { Slug } from '../value-objects/Slug.js';

export interface ListingSnapshot {
  id: number;
  userId: string;
  categoryId: number;
  provinceId: number;
  cityId: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceType: string;
  status: string;
  isFeatured: boolean;
  views: number;
  primaryImage: string | null;
  vehicleVariantId: number | null;
  version: number;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class Listing {
  private constructor(
    public readonly id: number,
    public readonly userId: string,
    public categoryId: number,
    public provinceId: number,
    public cityId: number,
    public title: string,
    public slug: Slug,
    public description: string,
    public price: Money,
    public priceType: PriceType,
    public status: ListingStatus,
    public isFeatured: boolean,
    public views: number,
    public primaryImage: string | null,
    public vehicleVariantId: number | null,
    public version: number,
    public readonly publishedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(props: {
    id: number;
    userId: string;
    categoryId: number;
    provinceId: number;
    cityId: number;
    title: string;
    description: string;
    price: number;
    priceType: string;
    vehicleVariantId?: number | null;
    slug?: string;
  }): Listing {
    return new Listing(
      props.id,
      props.userId,
      props.categoryId,
      props.provinceId,
      props.cityId,
      props.title,
      props.slug ? Slug.from(props.slug) : Slug.generate(props.title),
      props.description,
      Money.fromToman(props.price),
      parsePriceType(props.priceType),
      ListingStatus.Draft,
      false,
      0,
      null,
      props.vehicleVariantId ?? null,
      1,
      null,
      null,
      new Date(),
      new Date(),
      null,
    );
  }

  static fromSnapshot(s: ListingSnapshot): Listing {
    return new Listing(
      s.id, s.userId, s.categoryId, s.provinceId, s.cityId,
      s.title, Slug.from(s.slug), s.description,
      Money.fromToman(s.price), parsePriceType(s.priceType),
      parseListingStatus(s.status), s.isFeatured, s.views,
      s.primaryImage, s.vehicleVariantId, s.version,
      s.publishedAt ? new Date(s.publishedAt) : null,
      s.expiresAt ? new Date(s.expiresAt) : null,
      new Date(s.createdAt), new Date(s.updatedAt),
      s.deletedAt ? new Date(s.deletedAt) : null,
    );
  }

  snapshot(): ListingSnapshot {
    return {
      id: this.id, userId: this.userId,
      categoryId: this.categoryId, provinceId: this.provinceId,
      cityId: this.cityId, title: this.title, slug: this.slug.value,
      description: this.description, price: this.price.amount,
      priceType: this.priceType, status: this.status,
      isFeatured: this.isFeatured, views: this.views,
      primaryImage: this.primaryImage,
      vehicleVariantId: this.vehicleVariantId,
      version: this.version,
      publishedAt: this.publishedAt?.toISOString() ?? null,
      expiresAt: this.expiresAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }

  submit(): void {
    this.transitionTo(ListingStatus.Pending);
  }

  approve(): void {
    this.transitionTo(ListingStatus.Published);
    (this as any).publishedAt = new Date();
  }

  reject(): void {
    this.transitionTo(ListingStatus.Rejected);
  }

  markSold(): void {
    this.transitionTo(ListingStatus.Sold);
  }

  renew(): void {
    if (this.status !== ListingStatus.Published && this.status !== ListingStatus.Sold) {
      throw new Error('Only published or sold listings can be renewed');
    }
    (this as any).publishedAt = new Date();
  }

  update(props: Partial<Pick<Listing, 'title' | 'description' | 'price' | 'priceType' | 'categoryId' | 'provinceId' | 'cityId' | 'vehicleVariantId'>>): void {
    if (props.title) {
      this.title = props.title;
      (this as any).slug = Slug.generate(props.title);
    }
    if (props.description !== undefined) this.description = props.description;
    if (props.price !== undefined) this.price = props.price;
    if (props.priceType) this.priceType = props.priceType;
    if (props.categoryId) this.categoryId = props.categoryId;
    if (props.provinceId) this.provinceId = props.provinceId;
    if (props.cityId) this.cityId = props.cityId;
    if (props.vehicleVariantId !== undefined) this.vehicleVariantId = props.vehicleVariantId;
    this.version++;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    if (this.deletedAt) throw new Error('Already deleted');
    (this as any).deletedAt = new Date();
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  isActive(): boolean {
    return this.status === ListingStatus.Published && this.deletedAt === null;
  }

  private transitionTo(target: ListingStatus): void {
    if (!canTransition(this.status, target)) {
      throw new Error(`Cannot transition from ${this.status} to ${target}`);
    }
    (this as any).status = target;
    this.version++;
    this.updatedAt = new Date();
  }
}
