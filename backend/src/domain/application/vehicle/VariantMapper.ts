import { VehicleVariant } from '../../entities/vehicle/VehicleVariant.entity.js';
import { VariantDTO } from './VariantDTO.js';

export class VariantMapper {
  toDTO(variant: VehicleVariant): VariantDTO {
    return new VariantDTO(
      variant.id, variant.modelId, variant.name, variant.nameEn,
      variant.slug.value, variant.isActive,
      variant.createdAt.toISOString(), variant.updatedAt.toISOString(),
    );
  }
}

export const variantMapper = new VariantMapper();
