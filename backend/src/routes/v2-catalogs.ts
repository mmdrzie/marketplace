import { Hono } from 'hono';
import { catalogController } from '../domain/presentation/catalog/CatalogController.js';

export const v2CatalogsRoutes = new Hono();

// GET /v2/catalogs
v2CatalogsRoutes.get('/', (c) => catalogController.getCatalogs(c));

// GET /v2/catalogs/:slug
v2CatalogsRoutes.get('/:slug', (c) => catalogController.getCatalog(c));

// GET /v2/catalogs/:slug/categories
v2CatalogsRoutes.get('/:slug/categories', (c) => catalogController.getCategories(c));

// GET /v2/catalogs/:slug/categories/:id
v2CatalogsRoutes.get('/:slug/categories/:id', (c) => catalogController.getCategory(c));

// GET /v2/catalogs/:slug/parts
v2CatalogsRoutes.get('/:slug/parts', (c) => catalogController.listParts(c));

// GET /v2/catalogs/:slug/parts/:id/stores
v2CatalogsRoutes.get('/:slug/parts/:id/stores', (c) => catalogController.getPartStores(c));

// GET /v2/catalogs/:slug/parts/:id
v2CatalogsRoutes.get('/:slug/parts/:id', (c) => catalogController.getPart(c));
