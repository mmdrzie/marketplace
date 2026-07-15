import { Hono } from 'hono';
import { categoryRepo } from '../repositories/category.js';
import { attributeRepo } from '../repositories/attribute.js';
import { AppError } from '../errors.js';

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

function buildTree(categories: { id: number; parent_id: number | null }[], parentId: number | null = null): unknown[] {
  return categories
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      ...c,
      children: buildTree(categories, c.id),
    }));
}

export { router as categoryRouter };
