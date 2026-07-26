import { Brand } from '../../entities/vehicle/Brand.entity.js';
import { BrandDTO } from './BrandDTO.js';

export class BrandMapper {
  toDTO(brand: Brand): BrandDTO {
    return new BrandDTO(
      brand.id, brand.name, brand.nameEn, brand.slug.value,
      brand.logo, brand.country, brand.foundedYear,
      brand.website, brand.description, brand.isActive,
      brand.createdAt.toISOString(), brand.updatedAt.toISOString(),
    );
  }
}

export const brandMapper = new BrandMapper();
