import type { Context } from 'hono';
import { CreateBrandUseCase } from '../../application/vehicle/CreateBrandUseCase.js';
import { CreateModelUseCase } from '../../application/vehicle/CreateModelUseCase.js';
import { CreateVariantUseCase } from '../../application/vehicle/CreateVariantUseCase.js';
import { CreateBrandCommand } from '../../application/vehicle/commands/CreateBrandCommand.js';
import { CreateModelCommand } from '../../application/vehicle/commands/CreateModelCommand.js';
import { CreateVariantCommand } from '../../application/vehicle/commands/CreateVariantCommand.js';
import { VehicleRepository } from '../../entities/vehicle/Vehicle.repository.js';
import { brandMapper } from '../../application/vehicle/BrandMapper.js';
import { modelMapper } from '../../application/vehicle/ModelMapper.js';
import { variantMapper } from '../../application/vehicle/VariantMapper.js';

export class VehicleController {
  constructor(
    private readonly createBrandUseCase: CreateBrandUseCase,
    private readonly createModelUseCase: CreateModelUseCase,
    private readonly createVariantUseCase: CreateVariantUseCase,
    private readonly vehicleRepo: VehicleRepository,
  ) {}

  async createBrand(c: Context): Promise<Response> {
    const body = await c.req.json();
    const cmd = new CreateBrandCommand(
      body.name, body.nameEn, body.slug, body.logo,
      body.country, body.foundedYear, body.website, body.description,
    );
    const dto = await this.createBrandUseCase.execute(cmd);
    return c.json({ data: dto }, 201);
  }

  async createModel(c: Context): Promise<Response> {
    const body = await c.req.json();
    const cmd = new CreateModelCommand(
      body.brandId, body.name, body.nameEn, body.slug,
      body.segment, body.generation, body.bodyType,
      body.yearFrom, body.yearTo,
    );
    const dto = await this.createModelUseCase.execute(cmd);
    return c.json({ data: dto }, 201);
  }

  async createVariant(c: Context): Promise<Response> {
    const body = await c.req.json();
    const cmd = new CreateVariantCommand(
      body.modelId, body.name, body.nameEn, body.slug,
    );
    const dto = await this.createVariantUseCase.execute(cmd);
    return c.json({ data: dto }, 201);
  }

  async listBrands(c: Context): Promise<Response> {
    const category = c.req.query('category');
    const brands = category
      ? await this.vehicleRepo.findBrandsByCategory(category, true)
      : await this.vehicleRepo.findAllBrands(true);
    return c.json({ data: brands.map(b => brandMapper.toDTO(b)) });
  }

  async getBrand(c: Context): Promise<Response> {
    const slug = c.req.param('slug');
    if (!slug) return c.json({ error: 'Not found' }, 404);
    const brand = await this.vehicleRepo.findBrandBySlug(slug);
    if (!brand) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: brandMapper.toDTO(brand) });
  }

  async listModels(c: Context): Promise<Response> {
    const brandId = Number(c.req.param('brandId'));
    const category = c.req.query('category');
    const models = category
      ? await this.vehicleRepo.findModelsByBrandAndCategory(brandId, category, true)
      : await this.vehicleRepo.findModelsByBrand(brandId, true);
    return c.json({ data: models.map(m => modelMapper.toDTO(m)) });
  }

  async listVariants(c: Context): Promise<Response> {
    const modelId = Number(c.req.param('modelId'));
    const variants = await this.vehicleRepo.findVariantsByModel(modelId, true);
    return c.json({ data: variants.map(v => variantMapper.toDTO(v)) });
  }
}
