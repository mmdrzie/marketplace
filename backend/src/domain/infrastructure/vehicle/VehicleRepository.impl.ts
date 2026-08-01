import { getDb } from '../../../config/database.js';
import { Brand } from '../../entities/vehicle/Brand.entity.js';
import { VehicleModel } from '../../entities/vehicle/VehicleModel.entity.js';
import { VehicleVariant } from '../../entities/vehicle/VehicleVariant.entity.js';
import type { VehicleRepository } from '../../entities/vehicle/Vehicle.repository.js';

export class VehicleRepositoryImpl implements VehicleRepository {
  async findBrandById(id: number): Promise<Brand | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM brands WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (!rows.length) return null;
    return Brand.fromSnapshot(this.brandRow(rows[0] as Record<string, unknown>));
  }

  async findBrandBySlug(slug: string): Promise<Brand | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM brands WHERE slug = $1 AND deleted_at IS NULL', [slug]);
    if (!rows.length) return null;
    return Brand.fromSnapshot(this.brandRow(rows[0] as Record<string, unknown>));
  }

  async findAllBrands(activeOnly = true): Promise<Brand[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM brands WHERE deleted_at IS NULL${activeOnly ? ' AND is_active = true' : ''} ORDER BY name`,
    );
    return (rows as Record<string, unknown>[]).map(r => Brand.fromSnapshot(this.brandRow(r)));
  }

  async findBrandsByCategory(categorySlug: string, activeOnly = true): Promise<Brand[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT b.* FROM brands b
       JOIN brand_categories bc ON bc.brand_id = b.id
       JOIN categories c ON c.id = bc.category_id
       WHERE c.slug = $1 AND b.deleted_at IS NULL${activeOnly ? ' AND b.is_active = true' : ''}
       ORDER BY b.name`,
      [categorySlug],
    );
    return (rows as Record<string, unknown>[]).map(r => Brand.fromSnapshot(this.brandRow(r)));
  }

  async saveBrand(brand: Brand): Promise<void> {
    const db = await getDb();
    const s = brand.snapshot();
    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO brands (name, name_en, slug, logo, country, founded_year, website, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [s.name, s.nameEn, s.slug, s.logo, s.country, s.foundedYear, s.website, s.description],
      );
      (brand as any).id = (rows[0] as Record<string, unknown>).id;
    } else {
      await db.query(
        `UPDATE brands SET name=$1, name_en=$2, slug=$3, logo=$4, country=$5,
         founded_year=$6, website=$7, description=$8, is_active=$9, updated_at=NOW()
         WHERE id=$10`,
        [s.name, s.nameEn, s.slug, s.logo, s.country, s.foundedYear, s.website, s.description, s.isActive, s.id],
      );
    }
  }

  async findModelById(id: number): Promise<VehicleModel | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM vehicle_models WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (!rows.length) return null;
    return VehicleModel.fromSnapshot(this.modelRow(rows[0] as Record<string, unknown>));
  }

  async findModelsByBrand(brandId: number, activeOnly = true): Promise<VehicleModel[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM vehicle_models WHERE brand_id = $1 AND deleted_at IS NULL${activeOnly ? ' AND is_active = true' : ''} ORDER BY name`,
      [brandId],
    );
    return (rows as Record<string, unknown>[]).map(r => VehicleModel.fromSnapshot(this.modelRow(r)));
  }

  async findModelsByBrandAndCategory(brandId: number, categorySlug: string, activeOnly = true): Promise<VehicleModel[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT vm.* FROM vehicle_models vm
       JOIN categories c ON c.id = vm.category_id
       WHERE vm.brand_id = $1 AND c.slug = $2 AND vm.deleted_at IS NULL${activeOnly ? ' AND vm.is_active = true' : ''}
       ORDER BY vm.name`,
      [brandId, categorySlug],
    );
    return (rows as Record<string, unknown>[]).map(r => VehicleModel.fromSnapshot(this.modelRow(r)));
  }

  async saveModel(model: VehicleModel): Promise<void> {
    const db = await getDb();
    const s = model.snapshot();
    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO vehicle_models (brand_id, name, name_en, slug, segment, generation, body_type, year_from, year_to)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [s.brandId, s.name, s.nameEn, s.slug, s.segment, s.generation, s.bodyType, s.yearFrom, s.yearTo],
      );
      (model as any).id = (rows[0] as Record<string, unknown>).id;
    } else {
      await db.query(
        `UPDATE vehicle_models SET name=$1, name_en=$2, slug=$3, segment=$4, generation=$5,
         body_type=$6, year_from=$7, year_to=$8, is_active=$9, updated_at=NOW()
         WHERE id=$10`,
        [s.name, s.nameEn, s.slug, s.segment, s.generation, s.bodyType, s.yearFrom, s.yearTo, s.isActive, s.id],
      );
    }
  }

  async findVariantById(id: number): Promise<VehicleVariant | null> {
    const db = await getDb();
    const { rows } = await db.query('SELECT * FROM vehicle_variants WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (!rows.length) return null;
    return VehicleVariant.fromSnapshot(this.variantRow(rows[0] as Record<string, unknown>));
  }

  async findVariantsByModel(modelId: number, activeOnly = true): Promise<VehicleVariant[]> {
    const db = await getDb();
    const { rows } = await db.query(
      `SELECT * FROM vehicle_variants WHERE model_id = $1 AND deleted_at IS NULL${activeOnly ? ' AND is_active = true' : ''} ORDER BY name`,
      [modelId],
    );
    return (rows as Record<string, unknown>[]).map(r => VehicleVariant.fromSnapshot(this.variantRow(r)));
  }

  async saveVariant(variant: VehicleVariant): Promise<void> {
    const db = await getDb();
    const s = variant.snapshot();
    if (s.id === 0) {
      const { rows } = await db.query(
        `INSERT INTO vehicle_variants (model_id, name, name_en, slug)
         VALUES ($1,$2,$3,$4) RETURNING id`,
        [s.modelId, s.name, s.nameEn, s.slug],
      );
      (variant as any).id = (rows[0] as Record<string, unknown>).id;
    } else {
      await db.query(
        `UPDATE vehicle_variants SET name=$1, name_en=$2, slug=$3, is_active=$4, updated_at=NOW() WHERE id=$5`,
        [s.name, s.nameEn, s.slug, s.isActive, s.id],
      );
    }
  }

  private brandRow(r: Record<string, unknown>) {
    return {
      id: r.id as number, name: r.name as string, nameEn: r.name_en as string | null,
      slug: r.slug as string, logo: r.logo as string | null, country: r.country as string | null,
      foundedYear: r.founded_year as number | null, website: r.website as string | null,
      description: r.description as string | null, isActive: r.is_active as boolean,
      createdAt: r.created_at as string, updatedAt: r.updated_at as string,
      deletedAt: r.deleted_at as string | null,
    };
  }

  private modelRow(r: Record<string, unknown>) {
    return {
      id: r.id as number, brandId: r.brand_id as number, name: r.name as string,
      nameEn: r.name_en as string | null, slug: r.slug as string,
      segment: r.segment as string | null, generation: r.generation as string | null,
      bodyType: r.body_type as string | null, yearFrom: r.year_from as number | null,
      yearTo: r.year_to as number | null, isActive: r.is_active as boolean,
      createdAt: r.created_at as string, updatedAt: r.updated_at as string,
      deletedAt: r.deleted_at as string | null,
    };
  }

  private variantRow(r: Record<string, unknown>) {
    return {
      id: r.id as number, modelId: r.model_id as number, name: r.name as string,
      nameEn: r.name_en as string | null, slug: r.slug as string,
      isActive: r.is_active as boolean, createdAt: r.created_at as string,
      updatedAt: r.updated_at as string, deletedAt: r.deleted_at as string | null,
    };
  }
}
