'use client';

import Link from 'next/link';
import type { Content, ContentType } from '@/types/content';
import { useContents, useContentTypes, useContentCategories } from '@/hooks/useContents';
import { useMemo } from 'react';

export function ContentSidebar({
  typeFilter,
  activeCategory,
  onCategoryChange = () => {},
  categoryGroup,
}: {
  typeFilter?: string;
  activeCategory?: string;
  onCategoryChange?: (slug: string | undefined) => void;
  categoryGroup?: 'news' | 'knowledge';
}) {
  const { data: contents } = useContents(typeFilter);
  const { data: types } = useContentTypes();
  const { data: categories } = useContentCategories();

  const items = contents ?? [];
  const popular = useMemo(() => [...items].sort((a, b) => b.views - a.views).slice(0, 4), [items]);
  const allTags = useMemo(() => [...new Set(items.flatMap((a) => a.tags.map(t => t.label)))].slice(0, 15), [items]);

  const filteredCategories = useMemo(() => {
    const all = categories ?? [];
    if (categoryGroup === 'knowledge') return all.filter(c => c.parentId !== null);
    if (categoryGroup === 'news') return all.filter(c => c.parentId === null && c.slug !== 'knowledge');
    return all;
  }, [categories, categoryGroup]);

  const accent = 'var(--color-primary)';
  const activeClass = (isActive: boolean) => isActive
    ? 'font-bold'
    : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground';

  const activeStyle = (isActive: boolean) => isActive
    ? { backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)`, color: accent }
    : {};

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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-right transition-all ${activeClass(!activeCategory)}`}
            style={activeStyle(!activeCategory)}
          >
            همه
          </button>
          {(filteredCategories ?? []).map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onCategoryChange(cat.slug)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-right transition-all ${activeClass(activeCategory === cat.slug)}`}
              style={activeStyle(activeCategory === cat.slug)}
            >
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          داغ‌ترین
        </h3>
        <div className="space-y-3">
          {popular.map((content, i) => (
            <Link key={content.id} href={`/content/${content.slug}`} className="flex items-start gap-3 group">
              <span className="text-xs font-black text-muted-foreground w-5 shrink-0">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">{content.title}</p>
                <span className="text-[10px] text-muted-foreground">{content.views.toLocaleString('fa-IR')} بازدید</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-indigo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            برچسب‌ها
          </h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span key={tag} className="text-[10px] px-2.5 py-1.5 rounded-full bg-surface-2 border border-border-subtle text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}