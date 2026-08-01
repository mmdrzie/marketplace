import type { Content, ContentSnapshot } from './Content.entity.js';

export interface CreateContentData {
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  coverImage?: string | null;
  contentTypeId: number;
  categoryId?: number | null;
  authorId?: string | null;
  status?: string;
  isPinned?: boolean;
  readingTime?: number;
  difficulty?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  extraSeo?: Record<string, unknown>;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  tags?: { slug: string; label: string }[];
  links?: { entityType: string; entityId: number; label?: string }[];
}

export interface UpdateContentData {
  title?: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  coverImage?: string | null;
  contentTypeId?: number;
  categoryId?: number | null;
  authorId?: string | null;
  status?: string;
  isPinned?: boolean;
  readingTime?: number;
  difficulty?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  robots?: string | null;
  extraSeo?: Record<string, unknown>;
  publishedAt?: string | null;
  scheduledAt?: string | null;
}

export interface ContentFilter {
  type?: string;
  categoryId?: number;
  tagSlug?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ContentRepository {
  findAll(filter?: ContentFilter): Promise<Content[]>;
  findBySlug(slug: string): Promise<Content | null>;
  findById(id: number): Promise<Content | null>;
  findByEntity(entityType: string, entityId: number): Promise<Content[]>;
  findByCategory(categoryId: number): Promise<Content[]>;
  getRelated(contentId: number): Promise<Content[]>;
  create(data: CreateContentData): Promise<Record<string, unknown>>;
  update(id: number, data: UpdateContentData): Promise<Record<string, unknown>>;
  softDelete(id: number): Promise<void>;
  incrementViews(id: number): Promise<void>;

  getBookmarks(userId: string): Promise<Content[]>;
  addBookmark(userId: string, contentId: number): Promise<void>;
  removeBookmark(userId: string, contentId: number): Promise<void>;
  isBookmarked(userId: string, contentId: number): Promise<boolean>;

  addRelation(contentId: number, relatedId: number, type?: string): Promise<void>;
  removeRelation(contentId: number, relatedId: number): Promise<void>;

  addLink(contentId: number, entityType: string, entityId: number, label?: string): Promise<void>;
  removeLink(contentId: number, entityType: string, entityId: number): Promise<void>;

  addTags(contentId: number, tags: { slug: string; label: string }[]): Promise<void>;
  clearTags(contentId: number): Promise<void>;

  getContentTypes(): Promise<{ id: number; slug: string; label: string; icon: string | null; color: string | null }[]>;
  getCategories(parentId?: number | null): Promise<{ id: number; parentId: number | null; slug: string; title: string; description: string | null; icon: string | null; path: string | null }[]>;
}