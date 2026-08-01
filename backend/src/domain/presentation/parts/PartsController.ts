import type { Context } from 'hono';
import { partsService } from '../../services/partsService.js';
import { AppError } from '../../../errors.js';

export class PartsController {
  // --- Public ---

  async getCategories(c: Context) {
    const data = await partsService.getCategoryTree();
    return c.json({ success: true, data });
  }

  async getCategory(c: Context) {
    const slug = c.req.param('slug');
    if (!slug) throw AppError.notFound('Category not found');
    const cat = await partsService.getCategoryBySlug(slug);
    if (!cat) throw AppError.notFound('Category not found');
    return c.json({ success: true, data: cat });
  }

  async listParts(c: Context) {
    const q = c.req.query('q');
    const categorySlug = c.req.query('category');
    const categoryId = c.req.query('category_id');
    const brandId = c.req.query('brand_id');
    const modelId = c.req.query('model_id');
    const year = c.req.query('year');
    const store = c.req.query('store');
    const priceMin = c.req.query('price_min');
    const priceMax = c.req.query('price_max');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '24');

    const data = await partsService.listParts({
      q, partsCategorySlug: categorySlug,
      partsCategoryId: categoryId ? parseInt(categoryId) : undefined,
      brandId, modelId: modelId ? parseInt(modelId) : undefined,
      year: year ? parseInt(year) : undefined,
      storeSlug: store, priceMin: priceMin ? parseInt(priceMin) : undefined,
      priceMax: priceMax ? parseInt(priceMax) : undefined, page, limit,
    });
    return c.json({ success: true, data });
  }

  async getPart(c: Context) {
    const idParam = c.req.param('id');
    if (!idParam) throw AppError.notFound('Part not found');
    const id = parseInt(idParam);
    const part = await partsService.getPartById(id);
    if (!part) throw AppError.notFound('Part not found');
    return c.json({ success: true, data: part });
  }

  async getPartStores(c: Context) {
    const idParam = c.req.param('id');
    if (!idParam) throw AppError.notFound('Part not found');
    const id = parseInt(idParam);
    const stores = await partsService.getStoresForPart(id);
    return c.json({ success: true, data: stores });
  }

  async searchByVehicle(c: Context) {
    const brandId = c.req.query('brand_id');
    const modelId = c.req.query('model_id');
    const year = c.req.query('year');
    if (!brandId) throw AppError.badRequest('brand_id is required');
    const data = await partsService.searchByVehicle(
      brandId, modelId ? parseInt(modelId) : undefined,
      year ? parseInt(year) : undefined
    );
    return c.json({ success: true, data });
  }

  async listStores(c: Context) {
    const q = c.req.query('q');
    const data = await partsService.listStores({ q });
    return c.json({ success: true, data });
  }

  async getStore(c: Context) {
    const slug = c.req.param('slug');
    if (!slug) throw AppError.notFound('Store not found');
    const store = await partsService.getStoreBySlug(slug);
    if (!store) throw AppError.notFound('Store not found');
    return c.json({ success: true, data: store });
  }

  // --- Store Owner ---

  async registerStore(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    const data = await partsService.registerStoreProfile(user.id, body);
    return c.json({ success: true, data }, 201);
  }

  async getMyProfile(c: Context) {
    const user = c.get('user');
    const profile = await partsService.getStoreProfile(user.id);
    if (!profile) return c.json({ success: true, data: null });
    return c.json({ success: true, data: profile });
  }

  async updateMyProfile(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    const data = await partsService.updateStoreProfile(user.id, body);
    return c.json({ success: true, data });
  }

  async createSuggestion(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    const data = await partsService.createSuggestion(user.id, body);
    return c.json({ success: true, data }, 201);
  }

  async getMySuggestions(c: Context) {
    const user = c.get('user');
    const data = await partsService.getStoreSuggestions(user.id);
    return c.json({ success: true, data });
  }

  async getMyInventory(c: Context) {
    const user = c.get('user');
    const status = c.req.query('status');
    const categoryId = c.req.query('category_id');
    const data = await partsService.getStoreInventory(user.id, {
      status, partsCategoryId: categoryId ? parseInt(categoryId) : undefined,
    });
    return c.json({ success: true, data });
  }

  async addToInventory(c: Context) {
    const user = c.get('user');
    const body = await c.req.json();
    const data = await partsService.addStoreInventory(user.id, body);
    return c.json({ success: true, data }, 201);
  }

  async updateInventory(c: Context) {
    const user = c.get('user');
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    const body = await c.req.json();
    const data = await partsService.updateStoreInventory(user.id, id, body);
    return c.json({ success: true, data });
  }

  async deleteInventory(c: Context) {
    const user = c.get('user');
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    await partsService.deleteStoreInventory(user.id, id);
    return c.json({ success: true });
  }

  async getInventoryStats(c: Context) {
    const user = c.get('user');
    const data = await partsService.getInventoryStats(user.id);
    return c.json({ success: true, data });
  }

  // --- Admin ---

  async adminListStores(c: Context) {
    const status = c.req.query('status');
    const data = await partsService.adminListStores(status);
    return c.json({ success: true, data });
  }

  async adminApproveStore(c: Context) {
    const userId = c.req.param('id');
    if (!userId) throw AppError.badRequest('User ID required');
    const data = await partsService.adminApproveStore(userId);
    return c.json({ success: true, data });
  }

  async adminRejectStore(c: Context) {
    const userId = c.req.param('id');
    if (!userId) throw AppError.badRequest('User ID required');
    const body = await c.req.json();
    const data = await partsService.adminRejectStore(userId, body.note || '');
    return c.json({ success: true, data });
  }

  async adminListParts(c: Context) {
    const q = c.req.query('q');
    const categoryId = c.req.query('category_id');
    const partTypeId = c.req.query('part_type_id');
    const data = await partsService.adminListParts({
      q, partsCategoryId: categoryId ? parseInt(categoryId) : undefined,
      partTypeId: partTypeId ? parseInt(partTypeId) : undefined,
    });
    return c.json({ success: true, data });
  }

  async adminListPartTypes(c: Context) {
    const data = await partsService.adminListPartTypes();
    return c.json({ success: true, data });
  }

  async adminListCatalogTypes(c: Context) {
    const data = await partsService.adminListCatalogTypes();
    return c.json({ success: true, data });
  }

  async adminCreatePart(c: Context) {
    const body = await c.req.json();
    const data = await partsService.adminCreatePart(body);
    return c.json({ success: true, data }, 201);
  }

  async adminUpdatePart(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Part ID required');
    const body = await c.req.json();
    const data = await partsService.adminUpdatePart(id, body);
    return c.json({ success: true, data });
  }

  async adminSetPartSpecs(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Part ID required');
    const body = await c.req.json();
    const data = await partsService.adminSetPartSpecs(id, body.catalogTypeId, body.specs);
    return c.json({ success: true, data });
  }

  async adminDeletePart(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Part ID required');
    await partsService.adminDeletePart(id);
    return c.json({ success: true });
  }

  async adminListCategories(c: Context) {
    const data = await partsService.getCategoryTree();
    return c.json({ success: true, data });
  }

  async adminCreateCategory(c: Context) {
    const body = await c.req.json();
    const data = await partsService.adminCreateCategory(body);
    return c.json({ success: true, data }, 201);
  }

  async adminUpdateCategory(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Category ID required');
    const body = await c.req.json();
    const data = await partsService.adminUpdateCategory(id, body);
    return c.json({ success: true, data });
  }

  async adminDeleteCategory(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Category ID required');
    await partsService.adminDeleteCategory(id);
    return c.json({ success: true });
  }

  async adminListSuggestions(c: Context) {
    const status = c.req.query('status');
    const data = await partsService.adminListSuggestions(status);
    return c.json({ success: true, data });
  }

  async adminApproveSuggestion(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Suggestion ID required');
    const data = await partsService.adminApproveSuggestion(id);
    return c.json({ success: true, data });
  }

  async adminRejectSuggestion(c: Context) {
    const idParam = c.req.param('id');
    const id = parseInt(idParam || '0');
    if (!id) throw AppError.badRequest('Suggestion ID required');
    const body = await c.req.json();
    const data = await partsService.adminRejectSuggestion(id, body.note || '');
    return c.json({ success: true, data });
  }
}

export const partsController = new PartsController();
