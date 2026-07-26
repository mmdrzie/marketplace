import { Hono } from 'hono';
import { vehicleController } from '../container.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.get('/brands', (c) => vehicleController.listBrands(c));
router.get('/brands/:slug', (c) => vehicleController.getBrand(c));
router.post('/brands', auth(), (c) => vehicleController.createBrand(c));
router.get('/brands/:brandId/models', (c) => vehicleController.listModels(c));
router.post('/models', auth(), (c) => vehicleController.createModel(c));
router.get('/models/:modelId/variants', (c) => vehicleController.listVariants(c));
router.post('/variants', auth(), (c) => vehicleController.createVariant(c));

export { router as vehicleV2Router };
