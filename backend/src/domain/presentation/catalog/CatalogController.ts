import type { Context } from 'hono';
import { partsService } from '../../services/partsService.js';
import { AppError } from '../../../errors.js';

// Facade over PartsService (ADR-011): catalogs are views of the parts
// aggregate — no duplicate query logic lives here.
export class CatalogController {
  // --- Public ---

  async getCatalogs(c: Context) {
    const data = await partsService.getCatalogTypes(true);
    return c.json({ success: true, data });
  }

  async getCatalog(c: Context) {
    const slug = c.req.param('slug');
    if (!slug) throw AppError.notFound('Catalog not found');
    const data = await partsService.getCatalogTypeBySlug(slug, true);
    if (!data) throw AppError.notFound('Catalog not found');
    return c.json({ success: true, data });
  }

  async getCategories(c: Context) {
    const slug = c.req.param('slug');
    if (!slug) throw AppError.notFound('Catalog not found');
    const data = await partsService.getCatalogCategories(slug);
    return c.json({ success: true, data });
  }

  async getCategory(c: Context) {
    const slug = c.req.param('slug');
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!slug || !id) throw AppError.notFound('Category not found');
    const data = await partsService.getCatalogCategoryById(slug, id);
    if (!data) throw AppError.notFound('Category not found');
    return c.json({ success: true, data });
  }

  async listParts(c: Context) {
    const slug = c.req.param('slug');
    if (!slug) throw AppError.notFound('Catalog not found');
    const q = c.req.query('q');
    const categoryId = c.req.query('category');
    const brandId = c.req.query('brand_id');
    const modelId = c.req.query('model_id');
    const year = c.req.query('year');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '24');
    const sort = c.req.query('sort');

    const data = await partsService.listCatalogParts({
      catalogSlug: slug,
      q,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      brandId,
      modelId: modelId ? parseInt(modelId) : undefined,
      year: year ? parseInt(year) : undefined,
      page, limit, sort,
    });
    return c.json({ success: true, data });
  }

  async getPart(c: Context) {
    const slug = c.req.param('slug');
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!slug || !id) throw AppError.notFound('Part not found');
    const part = await partsService.getCatalogPartById(id);
    if (!part) throw AppError.notFound('Part not found');
    return c.json({ success: true, data: part });
  }

  async getPartStores(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.notFound('Part not found');
    const stores = await partsService.getStoresForPart(id);
    return c.json({ success: true, data: stores });
  }

  // --- Admin (one catalog panel — CRUD is generic for all catalogs) ---

  async adminListCategories(c: Context) {
    const type = c.req.query('type');
    const data = await partsService.adminListCatalogCategories(type || undefined);
    return c.json({ success: true, data });
  }

  async adminCreateCategory(c: Context) {
    const body = await c.req.json();
    const data = await partsService.adminCreateCatalogCategory(body);
    return c.json({ success: true, data }, 201);
  }

  async adminUpdateCategory(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Category ID required');
    const body = await c.req.json();
    const data = await partsService.adminUpdateCatalogCategory(id, body);
    return c.json({ success: true, data });
  }

  async adminDeleteCategory(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Category ID required');
    await partsService.adminDeleteCatalogCategory(id);
    return c.json({ success: true });
  }

  async adminRestoreCategory(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Category ID required');
    const data = await partsService.adminRestoreCatalogCategory(id);
    return c.json({ success: true, data });
  }
}

export const catalogController = new CatalogController();
