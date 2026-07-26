import { FavoriteRepositoryImpl } from '../domain/infrastructure/favorite/FavoriteRepository.impl.js';

export class FavoriteRepository {
  private _domainImpl: FavoriteRepositoryImpl;

  constructor(domainImpl?: FavoriteRepositoryImpl) {
    this._domainImpl = domainImpl ?? new FavoriteRepositoryImpl();
  }

  async findByUser(userId: string) {
    return this._domainImpl.findByUserWithListing(userId);
  }

  async toggle(userId: string, listingId: number): Promise<{ favorited: boolean }> {
    return this._domainImpl.toggle(userId, listingId);
  }
}

export const favoriteRepo = new FavoriteRepository();
