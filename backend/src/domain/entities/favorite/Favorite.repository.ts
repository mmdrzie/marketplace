import { Favorite } from './Favorite.entity.js';

export interface FavoriteRepository {
  findByUser(userId: string): Promise<Favorite[]>;
  findByUserWithListing(userId: string): Promise<Record<string, unknown>[]>;
  toggle(userId: string, listingId: number): Promise<{ favorited: boolean }>;
}
