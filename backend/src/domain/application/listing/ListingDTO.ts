export class ListingDTO {
  constructor(
    public readonly id: number,
    public readonly userId: string,
    public readonly categoryId: number,
    public readonly provinceId: number,
    public readonly cityId: number,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly price: number,
    public readonly priceType: string,
    public readonly status: string,
    public readonly isFeatured: boolean,
    public readonly views: number,
    public readonly primaryImage: string | null,
    public readonly vehicleVariantId: number | null,
    public readonly publishedAt: string | null,
    public readonly expiresAt: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string,
  ) {}
}
