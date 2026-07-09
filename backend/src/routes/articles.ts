import { Hono } from 'hono';
import { articleRepo } from '../repositories/article.js';
import { AppError } from '../errors.js';

const router = new Hono();

// GET /articles — published articles
router.get('/', async (c) => {
  const articles = await articleRepo.findAll();
  return c.json({ success: true, data: articles });
});

// GET /articles/:slug — full article
router.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  const article = await articleRepo.findBySlug(slug);
  if (!article) throw AppError.notFound('Article not found');

  articleRepo.incrementViews(article.id).catch(() => {});

  return c.json({ success: true, data: article });
});

export { router as articleRouter };
