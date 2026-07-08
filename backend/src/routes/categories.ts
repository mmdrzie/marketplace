import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { categoryRepo } from '../repositories/category';
import { attributeRepo } from '../repositories/attribute';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import { AppError } from '../errors';
import { createCategorySchema, updateCategorySchema, createAttributeSchema, updateAttributeSchema } from '../validation/categories';

const router = new Hono();

// Public: get category tree
router.get('/', async (c) => {
  const categories = await categoryRepo.findAll();
  const tree = buildTree(categories);
  return c.json({ success: true, data: tree });
});

// Public: get attributes for a category
router.get('/:slug/attributes', async (c) => {
  const slug = c.req.param('slug');
  const category = await categoryRepo.findBySlug(slug);
  if (!category) throw AppError.notFound('Category not found');

  const attributes = await attributeRepo.findByCategory(category.id);
  return c.json({ success: true, data: attributes });
});

// Admin: create category
router.post('/', auth(), adminAuth(), zValidator('json', createCategorySchema), async (c) => {
  const body = c.req.valid('json');
  const existing = await categoryRepo.findBySlug(body.slug);
  if (existing) throw AppError.resourceConflict('Slug already exists');

  const category = await categoryRepo.create(body);
  return c.json({ success: true, data: category }, 201);
});

// Admin: update category
router.put('/:id', auth(), adminAuth(), zValidator('json', updateCategorySchema), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const existing = await categoryRepo.findById(id);
  if (!existing) throw AppError.notFound('Category not found');

  const category = await categoryRepo.update(id, c.req.valid('json'));
  return c.json({ success: true, data: category });
});

// Admin: delete category
router.delete('/:id', auth(), adminAuth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const existing = await categoryRepo.findById(id);
  if (!existing) throw AppError.notFound('Category not found');

  await categoryRepo.delete(id);
  return c.json({ success: true, data: null });
});

// Admin: create attribute for category
router.post('/:id/attributes', auth(), adminAuth(), zValidator('json', createAttributeSchema), async (c) => {
  const categoryId = parseInt(c.req.param('id'), 10);
  const category = await categoryRepo.findById(categoryId);
  if (!category) throw AppError.notFound('Category not found');

  const body = c.req.valid('json');
  const attribute = await attributeRepo.create({ ...body, category_id: categoryId });
  return c.json({ success: true, data: attribute }, 201);
});

// Admin: update attribute
router.put('/attributes/:id', auth(), adminAuth(), zValidator('json', updateAttributeSchema), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const existing = await attributeRepo.findById(id);
  if (!existing) throw AppError.notFound('Attribute not found');

  const attribute = await attributeRepo.update(id, c.req.valid('json'));
  return c.json({ success: true, data: attribute });
});

// Admin: delete attribute
router.delete('/attributes/:id', auth(), adminAuth(), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  const existing = await attributeRepo.findById(id);
  if (!existing) throw AppError.notFound('Attribute not found');

  await attributeRepo.delete(id);
  return c.json({ success: true, data: null });
});

function buildTree(categories: { id: number; parent_id: number | null }[], parentId: number | null = null): unknown[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      ...c,
      children: buildTree(categories, c.id),
    }));
}

export { router as categoryRouter };
