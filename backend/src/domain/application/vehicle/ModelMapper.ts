import { VehicleModel } from '../../entities/vehicle/VehicleModel.entity.js';
import { ModelDTO } from './ModelDTO.js';

export class ModelMapper {
  toDTO(model: VehicleModel): ModelDTO {
    return new ModelDTO(
      model.id, model.brandId, model.name, model.nameEn,
      model.slug.value, model.segment, model.generation,
      model.bodyType, model.yearFrom, model.yearTo,
      model.isActive,
      model.createdAt.toISOString(), model.updatedAt.toISOString(),
    );
  }
}

export const modelMapper = new ModelMapper();
