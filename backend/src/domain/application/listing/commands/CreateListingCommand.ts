import { ListingAttribute } from '../../entities/listing/ListingAttribute.entity.js';
import { ListingMedia } from '../../entities/listing/ListingMedia.entity.js';

export class CreateListingCommand {
  constructor(
    public readonly userId: string,
    public readonly categoryId: number,
    public readonly provinceId: number,
    public readonly cityId: number,
    public readonly title: string,
    public readonly description: string,
    public readonly price: number,
    public readonly priceType: string,
    public readonly vehicleVariantId?: number | null,
    public readonly attributes?: ListingAttribute[],
    public readonly images?: ListingMedia[],
  ) {}
}
