export interface ContentType {
  id: number;
  slug: string;
  label: string;
  icon: string | null;
  color: string | null;
}

export interface ContentCategory {
  id: number;
  parentId: number | null;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  path: string | null;
}

export interface ContentTag {
  id: number;
  slug: string;
  label: string;
}

export interface ContentLink {
  entityType: string;
  entityId: number;
  label: string | null;
}

export interface Content {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string | null;
  contentType: ContentType;
  category: ContentCategory | null;
  author: { id: string; name: string } | null;
  status: 'draft' | 'review' | 'scheduled' | 'published' | 'archived';
  tags: ContentTag[];
  links: ContentLink[];
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

export type ContentTypeSlug =
  | 'news' | 'guide' | 'how_to' | 'maintenance'
  | 'glossary' | 'tech_spec' | 'review'
  | 'comparison' | 'buying_guide' | 'faq';

export const CONTENT_TYPE_META: Record<ContentTypeSlug, { label: string; icon: string; color: string }> = {
  news:          { label: 'اخبار',          icon: 'newspaper',      color: '#3B82F6' },
  guide:         { label: 'راهنما',         icon: 'book-open',      color: '#10B981' },
  how_to:        { label: 'آموزش',          icon: 'tools',          color: '#8B5CF6' },
  maintenance:   { label: 'نگهداری',        icon: 'wrench',         color: '#F59E0B' },
  glossary:      { label: 'واژه‌نامه',      icon: 'book-type',      color: '#EC4899' },
  tech_spec:     { label: 'مشخصات فنی',     icon: 'cpu',            color: '#06B6D4' },
  review:        { label: 'بررسی',          icon: 'star',           color: '#F97316' },
  comparison:    { label: 'مقایسه',         icon: 'columns',        color: '#6366F1' },
  buying_guide:  { label: 'راهنمای خرید',   icon: 'shopping-cart',  color: '#14B8A6' },
  faq:           { label: 'پرسش‌های متداول', icon: 'help-circle',    color: '#84CC16' },
};

export function isEncyclopediaType(slug: string): boolean {
  return !['news', 'faq'].includes(slug);
}

// Map content type slugs to the site's theme CSS variables (instead of hardcoded hex)
export const CONTENT_TYPE_THEME: Record<string, string> = {
  news:          'var(--color-primary)',
  guide:         'var(--color-success)',
  how_to:        'var(--color-accent-indigo)',
  maintenance:   'var(--color-warning)',
  glossary:      'var(--color-accent-purple)',
  tech_spec:     'var(--color-accent-blue)',
  review:        'var(--color-accent-sky)',
  comparison:    'var(--color-accent-indigo)',
  buying_guide:  'var(--color-success)',
  faq:           'var(--color-accent-purple)',
};

export function contentTypeThemeColor(slug: string): string {
  return CONTENT_TYPE_THEME[slug] ?? 'var(--color-primary)';
}

// Difficulty badges using theme variables
export const DIFFICULTY_THEME: Record<string, string> = {
  beginner:     'var(--color-success)',
  intermediate: 'var(--color-warning)',
  expert:       'var(--color-destructive)',
};

export function difficultyThemeColor(difficulty: string): string {
  return DIFFICULTY_THEME[difficulty] ?? 'var(--color-muted-foreground)';
}