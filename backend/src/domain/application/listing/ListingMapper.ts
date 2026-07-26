import { Listing } from '../../entities/listing/Listing.entity.js';
import { ListingDTO } from './ListingDTO.js';

export class ListingMapper {
  toDTO(listing: Listing): ListingDTO {
    return new ListingDTO(
      listing.id,
      listing.userId,
      listing.categoryId,
      listing.provinceId,
      listing.cityId,
      listing.title,
      listing.slug.value,
      listing.description,
      listing.price.amount,
      listing.priceType,
      listing.status,
      listing.isFeatured,
      listing.views,
      listing.primaryImage,
      listing.vehicleVariantId,
      listing.publishedAt?.toISOString() ?? null,
      listing.expiresAt?.toISOString() ?? null,
      listing.createdAt.toISOString(),
      listing.updatedAt.toISOString(),
    );
  }
}

export const listingMapper = new ListingMapper();
