import { Hono } from 'hono';
import { taxonomyController } from '../container.js';

const router = new Hono();

router.get('/:type/tree', (c) => taxonomyController.getTree(c));
router.get('/:type/:slug', (c) => taxonomyController.getNode(c));
router.get('/:type/:parentId/children', (c) => taxonomyController.getChildren(c));

export { router as taxonomyV2Router };
