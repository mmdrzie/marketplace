import { getDb } from '../../../config/database.js';
import type { VehicleProjectionRow, VehicleProjectionRepository } from './VehicleProjection.js';

export class VehicleProjectionRepositoryImpl implements VehicleProjectionRepository {
  async findBrands(): Promise<VehicleProjectionRow[]> {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT DISTINCT ON (b.id) b.id as brand_id, b.name as brand_name, b.name_en as brand_name_en,
        b.slug as brand_slug, b.logo as brand_logo
      FROM brands b WHERE b.deleted_at IS NULL AND b.is_active = true
      ORDER BY b.id, b.name
    `);
    return (rows as Record<string, unknown>[]).map(r => ({
      brandId: r.brand_id as number, brandName: r.brand_name as string,
      brandNameEn: r.brand_name_en as string | null, brandSlug: r.brand_slug as string,
      brandLogo: r.brand_logo as string | null,
      modelId: 0, modelName: '', modelSlug: '',
      modelYearFrom: null, modelYearTo: null,
      variantId: null, variantName: null, variantSlug: null,
    }));
  }

  async findModels(brandSlug: string): Promise<VehicleProjectionRow[]> {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT b.id as brand_id, b.name as brand_name, b.name_en as brand_name_en,
        b.slug as brand_slug, b.logo as brand_logo,
        vm.id as model_id, vm.name as model_name, vm.slug as model_slug,
        vm.year_from as model_year_from, vm.year_to as model_year_to
      FROM vehicle_models vm
      JOIN brands b ON b.id = vm.brand_id
      WHERE b.slug = $1 AND vm.deleted_at IS NULL AND vm.is_active = true
      ORDER BY vm.name
    `, [brandSlug]);
    return (rows as Record<string, unknown>[]).map(r => ({
      brandId: r.brand_id as number, brandName: r.brand_name as string,
      brandNameEn: r.brand_name_en as string | null, brandSlug: r.brand_slug as string,
      brandLogo: r.brand_logo as string | null,
      modelId: r.model_id as number, modelName: r.model_name as string,
      modelSlug: r.model_slug as string,
      modelYearFrom: r.model_year_from as number | null,
      modelYearTo: r.model_year_to as number | null,
      variantId: null, variantName: null, variantSlug: null,
    }));
  }

  async findVariants(modelSlug: string): Promise<VehicleProjectionRow[]> {
    const db = await getDb();
    const { rows } = await db.query(`
      SELECT b.id as brand_id, b.name as brand_name, b.name_en as brand_name_en,
        b.slug as brand_slug, b.logo as brand_logo,
        vm.id as model_id, vm.name as model_name, vm.slug as model_slug,
        vm.year_from as model_year_from, vm.year_to as model_year_to,
        vv.id as variant_id, vv.name as variant_name, vv.slug as variant_slug
      FROM vehicle_variants vv
      JOIN vehicle_models vm ON vm.id = vv.model_id
      JOIN brands b ON b.id = vm.brand_id
      WHERE vm.slug = $1 AND vv.deleted_at IS NULL AND vv.is_active = true
      ORDER BY vv.name
    `, [modelSlug]);
    return (rows as Record<string, unknown>[]).map(r => ({
      brandId: r.brand_id as number, brandName: r.brand_name as string,
      brandNameEn: r.brand_name_en as string | null, brandSlug: r.brand_slug as string,
      brandLogo: r.brand_logo as string | null,
      modelId: r.model_id as number, modelName: r.model_name as string,
      modelSlug: r.model_slug as string,
      modelYearFrom: r.model_year_from as number | null,
      modelYearTo: r.model_year_to as number | null,
      variantId: r.variant_id as number | null,
      variantName: r.variant_name as string | null,
      variantSlug: r.variant_slug as string | null,
    }));
  }

  async upsert(row: VehicleProjectionRow): Promise<void> {
    const db = await getDb();
    await db.query(
      `INSERT INTO vehicle_projection (brand_id, brand_name, brand_name_en, brand_slug, brand_logo,
        model_id, model_name, model_slug, model_year_from, model_year_to,
        variant_id, variant_name, variant_slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (brand_id, model_id, COALESCE(variant_id, 0)) DO UPDATE SET
         brand_name=EXCLUDED.brand_name, model_name=EXCLUDED.model_name,
         variant_name=EXCLUDED.variant_name`,
      [row.brandId, row.brandName, row.brandNameEn, row.brandSlug, row.brandLogo,
       row.modelId, row.modelName, row.modelSlug, row.modelYearFrom, row.modelYearTo,
       row.variantId, row.variantName, row.variantSlug],
    );
  }
}
