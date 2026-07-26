// VehicleProjection — Read model for vehicle browsing pages
export interface VehicleProjectionRow {
  brandId: number;
  brandName: string;
  brandNameEn: string | null;
  brandSlug: string;
  brandLogo: string | null;
  modelId: number;
  modelName: string;
  modelSlug: string;
  modelYearFrom: number | null;
  modelYearTo: number | null;
  variantId: number | null;
  variantName: string | null;
  variantSlug: string | null;
}

export interface VehicleProjectionRepository {
  findBrands(): Promise<VehicleProjectionRow[]>;
  findModels(brandSlug: string): Promise<VehicleProjectionRow[]>;
  findVariants(modelSlug: string): Promise<VehicleProjectionRow[]>;
  upsert(row: VehicleProjectionRow): Promise<void>;
}
