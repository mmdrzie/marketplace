import { Dealer } from '../domain/entities/dealer/Dealer.entity.js';
import { DealerRepositoryImpl } from '../domain/infrastructure/dealer/DealerRepository.impl.js';

export interface DealerProfileRow {
  user_id: string;
  business_name: string;
  logo: string | null;
  address: string | null;
  description: string | null;
  dealer_code: string | null;
  subscription_plan: string;
  subscription_expires_at: string | null;
  listings_limit: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export class DealerRepository {
  private _domainImpl: DealerRepositoryImpl;

  constructor(domainImpl?: DealerRepositoryImpl) {
    this._domainImpl = domainImpl ?? new DealerRepositoryImpl();
  }

  async findByUserId(userId: string) {
    const dealer = await this._domainImpl.findByUserId(userId);
    if (!dealer) return undefined;
    return this.snapshotToRow(dealer.snapshot());
  }

  async create(data: {
    user_id: string;
    business_name: string;
    logo?: string;
    address?: string;
    description?: string;
    dealer_code?: string;
  }) {
    const dealer = Dealer.fromSnapshot({
      id: 0,
      userId: data.user_id,
      name: '',
      slug: '',
      businessName: data.business_name,
      logo: data.logo ?? null,
      description: data.description ?? null,
      phone: null,
      address: data.address ?? null,
      latitude: null,
      longitude: null,
      dealerCode: data.dealer_code ?? `DLR-${Date.now().toString(36).toUpperCase()}`,
      subscriptionPlan: null,
      subscriptionExpiresAt: null,
      listingsLimit: null,
      isVerified: false,
      isActive: true,
      rating: 0,
      reviewCount: 0,
      publicId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await this._domainImpl.save(dealer);
    const created = await this._domainImpl.findByUserId(data.user_id);
    return created ? this.snapshotToRow(created.snapshot()) : this.snapshotToRow(dealer.snapshot());
  }

  async update(userId: string, data: Partial<DealerProfileRow>) {
    const existing = await this._domainImpl.findByUserId(userId);
    if (!existing) return undefined;

    if (data.business_name !== undefined) existing.businessName = data.business_name;
    if (data.logo !== undefined) existing.logo = data.logo;
    if (data.address !== undefined) existing.address = data.address;
    if (data.description !== undefined) existing.description = data.description;
    if (data.dealer_code !== undefined) existing.dealerCode = data.dealer_code;
    if (data.subscription_plan !== undefined) existing.subscriptionPlan = data.subscription_plan;
    if (data.subscription_expires_at !== undefined) existing.subscriptionExpiresAt = data.subscription_expires_at ? new Date(data.subscription_expires_at) : null;
    if (data.listings_limit !== undefined) existing.listingsLimit = data.listings_limit;
    if (data.is_verified !== undefined) existing.isVerified = data.is_verified;

    await this._domainImpl.save(existing);
    const updated = await this._domainImpl.findByUserId(userId);
    return updated ? this.snapshotToRow(updated.snapshot()) : undefined;
  }

  async getStats(userId: string) {
    return this._domainImpl.getStats(userId);
  }

  async getSubscription(userId: string) {
    return this._domainImpl.getSubscription(userId);
  }

  async addReview(data: { dealer_id: string; user_id: string; rating: number; comment?: string }) {
    return this._domainImpl.addReview(data);
  }

  private snapshotToRow(s: import('../domain/entities/dealer/Dealer.entity.js').DealerSnapshot): DealerProfileRow {
    return {
      user_id: s.userId,
      business_name: s.businessName ?? '',
      logo: s.logo,
      address: s.address,
      description: s.description,
      dealer_code: s.dealerCode,
      subscription_plan: s.subscriptionPlan ?? 'free',
      subscription_expires_at: s.subscriptionExpiresAt,
      listings_limit: s.listingsLimit ?? 0,
      is_verified: s.isVerified,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
    };
  }
}

export const dealerRepo = new DealerRepository();
