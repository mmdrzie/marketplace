import { Brand } from './Brand.entity.js';
import { VehicleModel } from './VehicleModel.entity.js';
import { VehicleVariant } from './VehicleVariant.entity.js';

export interface VehicleRepository {
  findBrandById(id: number): Promise<Brand | null>;
  findBrandBySlug(slug: string): Promise<Brand | null>;
  findAllBrands(activeOnly?: boolean): Promise<Brand[]>;
  findBrandsByCategory(categorySlug: string, activeOnly?: boolean): Promise<Brand[]>;
  saveBrand(brand: Brand): Promise<void>;
  findModelById(id: number): Promise<VehicleModel | null>;
  findModelsByBrand(brandId: number, activeOnly?: boolean): Promise<VehicleModel[]>;
  findModelsByBrandAndCategory(brandId: number, categorySlug: string, activeOnly?: boolean): Promise<VehicleModel[]>;
  saveModel(model: VehicleModel): Promise<void>;
  findVariantById(id: number): Promise<VehicleVariant | null>;
  findVariantsByModel(modelId: number, activeOnly?: boolean): Promise<VehicleVariant[]>;
  saveVariant(variant: VehicleVariant): Promise<void>;
}
