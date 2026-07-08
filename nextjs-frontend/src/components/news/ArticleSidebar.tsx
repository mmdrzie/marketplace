'use client';

import Link from 'next/link';
import type { Article } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  market: "M11 3.055A9.5 9.5 0 0 1 12 3a9.5 9.5 0 0 1 9.5 9.5c0 1.993-.5 3.315-1.305 4.5H3.805C3 15.815 2.5 14.493 2.5 12.5A9.5 9.5 0 0 1 11 3.055z M2 18h20 M8 21h8",
  guide: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  regulation: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M12 8v4 M12 16h.01",
  announcement: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
};

const CATEGORIES = [
  { slug: 'market', label: 'بازار', icon: 'market' },
  { slug: 'guide', label: 'راهنما', icon: 'guide' },
  { slug: 'regulation', label: 'قوانین', icon: 'regulation' },
  { slug: 'announcement', label: 'اعلان‌ها', icon: 'announcement' },
];

export function ArticleSidebar({
  articles,
  activeCategory,
  onCategoryChange,
}: {
  articles: Article[];
  activeCategory?: string;
  onCategoryChange: (slug: string | undefined) => void;
}) {
  const items = articles ?? [];
  const popular = [...items].sort((a, b) => b.views - a.views).slice(0, 4);
  const allTags = [...new Set(items.flatMap((a) => a.tags))].slice(0, 15);

  return (
    <aside className="space-y-6">
      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          دسته‌بندی‌ها
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(undefined)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-right transition-all ${
              !activeCategory ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
            }`}
          >
            همه مقالات
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((a) => a.category === cat.slug).length;
            return (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-right transition-all ${
                  activeCategory === cat.slug ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground'
                }`}
              >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={CATEGORY_ICONS[cat.icon]} /></svg>
                  {cat.label}
                </span>
                <span className="bg-surface-2 text-muted-foreground px-1.5 py-0.5 rounded-md text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          داغ‌ترین مقالات
        </h3>
        <div className="space-y-3">
          {popular.map((article, i) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="flex items-start gap-3 group"
            >
              <span className="text-xs font-black text-muted-foreground w-5 shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{article.title}</p>
                <span className="text-[10px] text-muted-foreground">{article.views.toLocaleString('fa-IR')} بازدید</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
          برچسب‌ها
        </h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onCategoryChange(undefined)}
              className="text-[10px] px-2.5 py-1.5 rounded-full bg-surface-2 border border-border-subtle text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
