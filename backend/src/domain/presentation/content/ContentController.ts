import type { Context } from 'hono';
import { ContentRepositoryImpl } from '../../infrastructure/content/ContentRepository.impl.js';
import { ContentService } from '../../services/contentService.js';

export class ContentController {
  constructor(
    private readonly repo: ContentRepositoryImpl,
    private readonly service: ContentService,
  ) {}

  async list(c: Context, typeFilter?: string): Promise<Response> {
    const type = typeFilter ?? c.req.query('type');
    const categorySlug = c.req.query('category');
    const tag = c.req.query('tag');
    const status = c.req.query('status');
    const search = c.req.query('search');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined;

    const contents = await this.repo.findAll({
      type,
      tagSlug: tag,
      status,
      search,
      limit,
      offset,
    });
    return c.json({ data: contents.map(a => a.snapshot()) });
  }

  async get(c: Context): Promise<Response> {
    const slug = c.req.param('slug');
    if (!slug) return c.json({ error: 'Not found' }, 404);
    const content = await this.repo.findBySlug(slug);
    if (!content) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: content.snapshot() });
  }

  async getById(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!!, 10);
    if (!id) return c.json({ error: 'Invalid id' }, 400);
    const content = await this.repo.findById(id);
    if (!content) return c.json({ error: 'Not found' }, 404);
    return c.json({ data: content.snapshot() });
  }

  async create(c: Context): Promise<Response> {
    const body = await c.req.json();
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '');
    const readingTime = body.readingTime ?? this.service.calculateReadingTime(body.body ?? '');

    const data = {
      title: body.title,
      slug,
      excerpt: body.excerpt,
      body: body.body,
      coverImage: body.coverImage,
      contentTypeId: body.contentTypeId,
      categoryId: body.categoryId,
      authorId: body.authorId,
      status: body.status ?? 'draft',
      isPinned: body.isPinned,
      readingTime,
      difficulty: body.difficulty,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      canonicalUrl: body.canonicalUrl,
      ogImage: body.ogImage,
      robots: body.robots,
      extraSeo: body.extraSeo,
      publishedAt: body.publishedAt,
      scheduledAt: body.scheduledAt,
      tags: body.tags,
      links: body.links,
    };

    const snapshot = await this.repo.create(data);
    return c.json({ data: snapshot }, 201);
  }

  async update(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    if (!id) return c.json({ error: 'Invalid id' }, 400);
    const body = await c.req.json();

    if (body.body && !body.readingTime) {
      body.readingTime = this.service.calculateReadingTime(body.body);
    }

    const snapshot = await this.repo.update(id, body);
    return c.json({ data: snapshot });
  }

  async delete(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    if (!id) return c.json({ error: 'Invalid id' }, 400);
    await this.repo.softDelete(id);
    return c.json({ success: true });
  }

  async incrementViews(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    if (!id) return c.json({ error: 'Invalid id' }, 400);
    await this.repo.incrementViews(id);
    return c.json({ success: true });
  }

  async getByEntity(c: Context): Promise<Response> {
    const entityType = c.req.param('entityType')?.toUpperCase();
    const entityId = parseInt(c.req.param('entityId')!, 10);
    if (!entityType || !entityId) return c.json({ error: 'Invalid params' }, 400);
    const contents = await this.repo.findByEntity(entityType, entityId);
    return c.json({ data: contents.map(a => a.snapshot()) });
  }

  async getByCategory(c: Context): Promise<Response> {
    const categoryId = parseInt(c.req.param('categoryId')!, 10);
    if (!categoryId) return c.json({ error: 'Invalid category id' }, 400);
    const contents = await this.repo.findByCategory(categoryId);
    return c.json({ data: contents.map(a => a.snapshot()) });
  }

  async getRelated(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    if (!id) return c.json({ error: 'Invalid id' }, 400);
    const contents = await this.repo.getRelated(id);
    return c.json({ data: contents.map(a => a.snapshot()) });
  }

  async addRelation(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    const body = await c.req.json();
    if (!id || !body.relatedId) return c.json({ error: 'Invalid params' }, 400);
    await this.repo.addRelation(id, body.relatedId, body.type);
    return c.json({ success: true });
  }

  async removeRelation(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    const body = await c.req.json();
    if (!id || !body.relatedId) return c.json({ error: 'Invalid params' }, 400);
    await this.repo.removeRelation(id, body.relatedId);
    return c.json({ success: true });
  }

  async addLink(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    const body = await c.req.json();
    if (!id || !body.entityType || !body.entityId) return c.json({ error: 'Invalid params' }, 400);
    await this.repo.addLink(id, body.entityType.toUpperCase(), body.entityId, body.label);
    return c.json({ success: true });
  }

  async removeLink(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    const body = await c.req.json();
    if (!id || !body.entityType || !body.entityId) return c.json({ error: 'Invalid params' }, 400);
    await this.repo.removeLink(id, body.entityType.toUpperCase(), body.entityId);
    return c.json({ success: true });
  }

  async addTags(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    const body = await c.req.json();
    if (!id || !body.tags?.length) return c.json({ error: 'Invalid params' }, 400);
    const existing = await this.repo.findById(id);
    if (!existing) return c.json({ error: 'Not found' }, 404);
    await this.repo.addTags(id, body.tags);
    return c.json({ success: true });
  }

  async clearTags(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    if (!id) return c.json({ error: 'Invalid id' }, 400);
    await this.repo.clearTags(id);
    return c.json({ success: true });
  }

  async bookmark(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    const userId = c.get('userId');
    if (!id || !userId) return c.json({ error: 'Unauthorized' }, 401);
    await this.repo.addBookmark(userId, id);
    return c.json({ success: true });
  }

  async unbookmark(c: Context): Promise<Response> {
    const id = parseInt(c.req.param('id')!, 10);
    const userId = c.get('userId');
    if (!id || !userId) return c.json({ error: 'Unauthorized' }, 401);
    await this.repo.removeBookmark(userId, id);
    return c.json({ success: true });
  }

  async getBookmarks(c: Context): Promise<Response> {
    const userId = c.get('userId');
    if (!userId) return c.json({ error: 'Unauthorized' }, 401);
    const contents = await this.repo.getBookmarks(userId);
    return c.json({ data: contents.map(a => a.snapshot()) });
  }

  async getContentTypes(c: Context): Promise<Response> {
    const types = await this.repo.getContentTypes();
    return c.json({ data: types });
  }

  async getCategories(c: Context): Promise<Response> {
    const parentId = c.req.query('parentId') ? parseInt(c.req.query('parentId')!, 10) : undefined;
    const categories = await this.repo.getCategories(parentId);
    return c.json({ data: categories });
  }

  async generateTOC(c: Context): Promise<Response> {
    const slug = c.req.param('slug')!;
    const content = await this.repo.findBySlug(slug);
    if (!content) return c.json({ error: 'Not found' }, 404);
    const toc = this.service.extractTOC(content.snapshot().body);
    return c.json({ data: toc });
  }
}