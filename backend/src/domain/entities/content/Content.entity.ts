export interface ContentTypeInfo {
  id: number;
  slug: string;
  label: string;
  icon: string | null;
  color: string | null;
}

export interface ContentCategoryInfo {
  id: number;
  slug: string;
  title: string;
  path: string | null;
  parentId: number | null;
}

export interface ContentTagInfo {
  id: number;
  slug: string;
  label: string;
}

export interface ContentLinkInfo {
  entityType: string;
  entityId: number;
  label: string | null;
}

export interface ContentSnapshot {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  contentType: ContentTypeInfo;
  category: ContentCategoryInfo | null;
  author: { id: string; name: string } | null;
  status: string;
  tags: ContentTagInfo[];
  links: ContentLinkInfo[];
  relatedContentIds: number[];
  isPinned: boolean;
  views: number;
  readingTime: number;
  difficulty: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  robots: string | null;
  extraSeo: Record<string, unknown>;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class Content {
  private constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly slug: string,
    public readonly excerpt: string,
    public readonly body: string,
    public readonly coverImage: string | null,
    public readonly contentType: ContentTypeInfo,
    public readonly category: ContentCategoryInfo | null,
    public readonly author: { id: string; name: string } | null,
    public readonly status: string,
    public readonly tags: ContentTagInfo[],
    public readonly links: ContentLinkInfo[],
    public readonly relatedContentIds: number[],
    public readonly isPinned: boolean,
    public views: number,
    public readonly readingTime: number,
    public readonly difficulty: string | null,
    public readonly metaTitle: string | null,
    public readonly metaDescription: string | null,
    public readonly canonicalUrl: string | null,
    public readonly ogImage: string | null,
    public readonly robots: string | null,
    public readonly extraSeo: Record<string, unknown>,
    public readonly publishedAt: Date | null,
    public readonly scheduledAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static fromSnapshot(s: ContentSnapshot): Content {
    return new Content(
      s.id, s.title, s.slug, s.excerpt, s.body, s.coverImage,
      s.contentType, s.category, s.author, s.status,
      s.tags, s.links, s.relatedContentIds, s.isPinned, s.views,
      s.readingTime, s.difficulty,
      s.metaTitle, s.metaDescription, s.canonicalUrl, s.ogImage, s.robots, s.extraSeo,
      s.publishedAt ? new Date(s.publishedAt) : null,
      s.scheduledAt ? new Date(s.scheduledAt) : null,
      new Date(s.createdAt), new Date(s.updatedAt),
      s.deletedAt ? new Date(s.deletedAt) : null,
    );
  }

  snapshot(): ContentSnapshot {
    return {
      id: this.id, title: this.title, slug: this.slug,
      excerpt: this.excerpt, body: this.body, coverImage: this.coverImage,
      contentType: this.contentType, category: this.category,
      author: this.author, status: this.status,
      tags: this.tags, links: this.links,
      relatedContentIds: this.relatedContentIds,
      isPinned: this.isPinned, views: this.views,
      readingTime: this.readingTime, difficulty: this.difficulty,
      metaTitle: this.metaTitle, metaDescription: this.metaDescription,
      canonicalUrl: this.canonicalUrl, ogImage: this.ogImage,
      robots: this.robots, extraSeo: this.extraSeo,
      publishedAt: this.publishedAt?.toISOString() ?? null,
      scheduledAt: this.scheduledAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      deletedAt: this.deletedAt?.toISOString() ?? null,
    };
  }

  incrementViews(): void {
    this.views += 1;
  }
}