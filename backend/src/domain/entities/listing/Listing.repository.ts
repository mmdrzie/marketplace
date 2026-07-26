import { Listing } from './Listing.entity.js';
import { ListingAttribute } from './ListingAttribute.entity.js';
import { ListingMedia } from './ListingMedia.entity.js';

export interface ListingsQuery {
  scope?: 'all' | 'me';
  userId?: string;
  categoryId?: number;
  provinceId?: number;
  cityId?: number;
  brandId?: number;
  modelId?: number;
  status?: string;
  priceMin?: number;
  priceMax?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ListingDetails {
  listing: Listing;
  attributes: ListingAttribute[];
  media: ListingMedia[];
}

export interface ListingRepository {
  findById(id: number): Promise<Listing | null>;
  findBySlug(slug: string): Promise<Listing | null>;
  findAll(query: ListingsQuery): Promise<{ items: Listing[]; total: number }>;
  save(listing: Listing): Promise<void>;
  delete(id: number): Promise<void>;
  getDetails(id: number): Promise<ListingDetails | null>;
}
