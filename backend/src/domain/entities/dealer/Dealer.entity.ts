export interface DealerSnapshot {
  id: number;
  userId: string;
  name: string;
  slug: string;
  businessName: string | null;
  logo: string | null;
  description: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  dealerCode: string | null;
  subscriptionPlan: string | null;
  subscriptionExpiresAt: string | null;
  listingsLimit: number | null;
  isVerified: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  publicId: string | null;
  createdAt: string;
  updatedAt: string;
}

export class Dealer {
  private constructor(
    public readonly id: number,
    public readonly userId: string,
    public name: string,
    public slug: string,
    public businessName: string | null,
    public logo: string | null,
    public description: string | null,
    public phone: string | null,
    public address: string | null,
    public latitude: number | null,
    public longitude: number | null,
    public dealerCode: string | null,
    public subscriptionPlan: string | null,
    public subscriptionExpiresAt: Date | null,
    public listingsLimit: number | null,
    public isVerified: boolean,
    public isActive: boolean,
    public rating: number,
    public reviewCount: number,
    public publicId: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static fromSnapshot(s: DealerSnapshot): Dealer {
    return new Dealer(
      s.id, s.userId, s.name, s.slug,
      s.businessName, s.logo, s.description,
      s.phone, s.address, s.latitude, s.longitude,
      s.dealerCode, s.subscriptionPlan,
      s.subscriptionExpiresAt ? new Date(s.subscriptionExpiresAt) : null,
      s.listingsLimit,
      s.isVerified, s.isActive, s.rating, s.reviewCount,
      s.publicId, new Date(s.createdAt), new Date(s.updatedAt),
    );
  }

  snapshot(): DealerSnapshot {
    return {
      id: this.id, userId: this.userId,
      name: this.name, slug: this.slug,
      businessName: this.businessName, logo: this.logo,
      description: this.description, phone: this.phone,
      address: this.address, latitude: this.latitude,
      longitude: this.longitude, dealerCode: this.dealerCode,
      subscriptionPlan: this.subscriptionPlan,
      subscriptionExpiresAt: this.subscriptionExpiresAt?.toISOString() ?? null,
      listingsLimit: this.listingsLimit,
      isVerified: this.isVerified, isActive: this.isActive,
      rating: this.rating, reviewCount: this.reviewCount,
      publicId: this.publicId,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  verify(): void {
    this.isVerified = true;
    this.updatedAt = new Date();
  }
}
