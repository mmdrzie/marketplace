import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { adminController } from '../container.js';
import { partsController } from '../domain/presentation/parts/PartsController.js';
import { catalogController } from '../domain/presentation/catalog/CatalogController.js';
import { workshopController } from '../domain/presentation/workshop/WorkshopController.js';
import { auth } from '../middleware/auth.js';

const router = new Hono();

router.use('*', auth('admin'));

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100),
  role: z.enum(['user', 'dealer', 'agency', 'store', 'workshop', 'admin']).optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['user', 'dealer', 'agency', 'store', 'workshop', 'admin']).optional(),
  status: z.enum(['active', 'banned', 'suspended']).optional(),
  phone: z.string().optional(),
});

// Users
router.get('/users', (c) => adminController.listUsers(c));
router.post('/users', zValidator('json', createUserSchema), (c) => adminController.createUser(c));
router.put('/users/:id', zValidator('json', updateUserSchema), (c) => adminController.updateUser(c));
router.put('/users/:id/role', zValidator('json', z.object({ role: z.enum(['user', 'dealer', 'agency', 'store', 'workshop', 'admin']) })), (c) => adminController.updateUserRole(c));

// Stores management
router.get('/stores', (c) => partsController.adminListStores(c));
router.put('/stores/:id/approve', (c) => partsController.adminApproveStore(c));
router.put('/stores/:id/reject', zValidator('json', z.object({ note: z.string() })), (c) => partsController.adminRejectStore(c));

// Parts catalog
router.get('/parts', (c) => partsController.adminListParts(c));
router.post('/parts', (c) => partsController.adminCreatePart(c));
router.put('/parts/:id', (c) => partsController.adminUpdatePart(c));
router.put('/parts/:id/specs', (c) => partsController.adminSetPartSpecs(c));
router.delete('/parts/:id', (c) => partsController.adminDeletePart(c));

// Parts categories
router.get('/parts-categories', (c) => partsController.adminListCategories(c));
router.post('/parts-categories', (c) => partsController.adminCreateCategory(c));
router.put('/parts-categories/:id', (c) => partsController.adminUpdateCategory(c));
router.delete('/parts-categories/:id', (c) => partsController.adminDeleteCategory(c));

// Catalog categories (generic — one CRUD for tuning, audio, camping, ...)
router.get('/catalog-categories', (c) => catalogController.adminListCategories(c));
router.post('/catalog-categories', (c) => catalogController.adminCreateCategory(c));
router.put('/catalog-categories/:id', (c) => catalogController.adminUpdateCategory(c));
router.delete('/catalog-categories/:id', (c) => catalogController.adminDeleteCategory(c));
router.put('/catalog-categories/:id/restore', (c) => catalogController.adminRestoreCategory(c));

// Read-only lookups (Configuration — no CRUD)
router.get('/part-types', (c) => partsController.adminListPartTypes(c));
router.get('/catalog-types', (c) => partsController.adminListCatalogTypes(c));

// Suggestions
router.get('/parts/suggestions', (c) => partsController.adminListSuggestions(c));
router.put('/parts/suggestions/:id/approve', (c) => partsController.adminApproveSuggestion(c));
router.put('/parts/suggestions/:id/reject', zValidator('json', z.object({ note: z.string() })), (c) => partsController.adminRejectSuggestion(c));

// Workshops (تعمیرکار / تیونر)
router.get('/workshops', (c) => workshopController.adminList(c));
router.put('/workshops/:id/approve', (c) => workshopController.adminApprove(c));
router.put('/workshops/:id/reject', zValidator('json', z.object({ note: z.string() })), (c) => workshopController.adminReject(c));
router.put('/workshops/:id/suspend', (c) => workshopController.adminSuspend(c));
router.put('/workshops/:id', (c) => workshopController.adminUpdate(c));
router.delete('/workshops/:id', (c) => workshopController.adminDelete(c));

export { router as adminRouter };
