export class UpdateListingCommand {
  constructor(
    public readonly listingId: number,
    public readonly userId: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly price?: number,
    public readonly priceType?: string,
    public readonly categoryId?: number,
    public readonly provinceId?: number,
    public readonly cityId?: number,
    public readonly vehicleVariantId?: number | null,
  ) {}
}
