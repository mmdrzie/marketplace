export interface ArticleSnapshot {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  category: string | null;
  author: string;
  tags: string[];
  isPinned: boolean;
  views: number;
  readingTime: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export class Article {
  private constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly slug: string,
    public readonly excerpt: string,
    public readonly body: string,
    public readonly coverImage: string | null,
    public readonly category: string | null,
    public readonly author: string,
    public readonly tags: string[],
    public readonly isPinned: boolean,
    public views: number,
    public readonly readingTime: number,
    public readonly publishedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static fromSnapshot(s: ArticleSnapshot): Article {
    return new Article(s.id, s.title, s.slug, s.excerpt, s.body, s.coverImage, s.category, s.author, s.tags, s.isPinned, s.views, s.readingTime, s.publishedAt ? new Date(s.publishedAt) : null, new Date(s.createdAt), new Date(s.updatedAt), s.deletedAt ? new Date(s.deletedAt) : null);
  }

  snapshot(): ArticleSnapshot {
    return { id: this.id, title: this.title, slug: this.slug, excerpt: this.excerpt, body: this.body, coverImage: this.coverImage, category: this.category, author: this.author, tags: this.tags, isPinned: this.isPinned, views: this.views, readingTime: this.readingTime, publishedAt: this.publishedAt?.toISOString() ?? null, createdAt: this.createdAt.toISOString(), updatedAt: this.updatedAt.toISOString(), deletedAt: this.deletedAt?.toISOString() ?? null };
  }

  incrementViews(): void {
    this.views += 1;
  }
}
