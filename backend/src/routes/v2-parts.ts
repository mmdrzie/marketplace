import { Hono } from 'hono';
import { partsController } from '../domain/presentation/parts/PartsController.js';

const router = new Hono();

// Parts categories
router.get('/categories', (c) => partsController.getCategories(c));
router.get('/categories/:slug', (c) => partsController.getCategory(c));

// Parts
router.get('/', (c) => partsController.listParts(c));
router.get('/search/vehicle', (c) => partsController.searchByVehicle(c));
router.get('/:id', (c) => partsController.getPart(c));
router.get('/:id/stores', (c) => partsController.getPartStores(c));

// Stores
router.get('/stores', (c) => partsController.listStores(c));
router.get('/stores/:slug', (c) => partsController.getStore(c));

export { router as partsV2Router };
