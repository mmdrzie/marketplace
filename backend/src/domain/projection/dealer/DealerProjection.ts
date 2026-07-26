// DealerProjection — Read model for dealer profile/public pages
export interface DealerProjectionRow {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  listingCount: number;
  createdAt: string;
}

export interface DealerProjectionRepository {
  findBySlug(slug: string): Promise<DealerProjectionRow | null>;
  findAll(verifiedOnly?: boolean): Promise<DealerProjectionRow[]>;
  upsert(row: DealerProjectionRow): Promise<void>;
}
