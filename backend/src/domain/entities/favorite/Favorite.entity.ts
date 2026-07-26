export interface FavoriteSnapshot {
  userId: string;
  listingId: number;
  favoritedAt: string;
}

export class Favorite {
  private constructor(
    public readonly userId: string,
    public readonly listingId: number,
    public readonly favoritedAt: Date,
  ) {}

  static create(userId: string, listingId: number): Favorite {
    return new Favorite(userId, listingId, new Date());
  }

  static fromSnapshot(s: FavoriteSnapshot): Favorite {
    return new Favorite(s.userId, s.listingId, new Date(s.favoritedAt));
  }

  snapshot(): FavoriteSnapshot {
    return {
      userId: this.userId,
      listingId: this.listingId,
      favoritedAt: this.favoritedAt.toISOString(),
    };
  }
}
