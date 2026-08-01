import { Hono } from 'hono';
import { contentController } from '../container.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = new Hono();

router.get('/', (c) => contentController.list(c));
router.get('/types', (c) => contentController.getContentTypes(c));
router.get('/categories', (c) => contentController.getCategories(c));
router.get('/bookmarks', (c) => contentController.getBookmarks(c));
router.get('/entity/:entityType/:entityId', (c) => contentController.getByEntity(c));
router.get('/category/:categoryId', (c) => contentController.getByCategory(c));
router.get('/:slug', (c) => contentController.get(c));
router.get('/:slug/toc', (c) => contentController.generateTOC(c));
router.get('/:id/related', (c) => contentController.getRelated(c));

router.post('/', (c) => contentController.create(c));
router.post('/:id/bookmark', (c) => contentController.bookmark(c));
router.post('/:id/relations', (c) => contentController.addRelation(c));
router.post('/:id/links', (c) => contentController.addLink(c));
router.post('/:id/tags', (c) => contentController.addTags(c));
router.post('/:id/views', rateLimiter('article:view'), (c) => contentController.incrementViews(c));

router.patch('/:id', (c) => contentController.update(c));

router.delete('/:id', (c) => contentController.delete(c));
router.delete('/:id/bookmark', (c) => contentController.unbookmark(c));
router.delete('/:id/relations', (c) => contentController.removeRelation(c));
router.delete('/:id/links', (c) => contentController.removeLink(c));
router.delete('/:id/tags', (c) => contentController.clearTags(c));

export { router as contentV2Router };