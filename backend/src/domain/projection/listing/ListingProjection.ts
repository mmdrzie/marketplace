// ListingProjection — Read model for public listing pages (denormalized)
export interface ListingProjectionRow {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  priceType: string;
  status: string;
  isFeatured: boolean;
  views: number;
  primaryImage: string | null;
  categoryId: number;
  categoryName: string | null;
  provinceId: number | null;
  provinceName: string | null;
  cityId: number | null;
  cityName: string | null;
  userId: string;
  userName: string | null;
  userPhone: string | null;
  dealerName: string | null;
  dealerPhone: string | null;
  vehicleVariantId: number | null;
  brandName: string | null;
  modelName: string | null;
  variantName: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface ListingProjectionFilter {
  categoryId?: number;
  provinceId?: number;
  brandId?: number;
  modelId?: number;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ListingProjectionRepository {
  findBySlug(slug: string): Promise<ListingProjectionRow | null>;
  findAll(filter: ListingProjectionFilter): Promise<{ items: ListingProjectionRow[]; total: number }>;
  upsert(row: ListingProjectionRow): Promise<void>;
  remove(id: number): Promise<void>;
}
