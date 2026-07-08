'use client';

import Link from 'next/link';
import type { Article } from '@/types';

const CATEGORY_STYLES: Record<string, { badge: string }> = {
  market: { badge: 'bg-warning/10 text-warning border-warning/20' },
  guide: { badge: 'bg-primary/10 text-primary border-primary/20' },
  regulation: { badge: 'bg-primary/10 text-primary border-primary/20' },
  announcement: { badge: 'bg-destructive/10 text-destructive border-destructive/20' },
};

export function NewsCard({ article }: { article: Article }) {
  const style = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.guide;

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group relative block bg-surface/40 border border-border rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:border-primary/40 hover:bg-surface hover:-translate-y-1 h-full flex flex-col backdrop-blur-sm"
    >
      {/* افکت درخشش در هاور */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${style.badge} transition-colors`}>
            {article.category_label}
          </span>
          <span className="text-[10px] text-muted-foreground">{article.published_at}</span>
        </div>

        <h3 className="font-bold text-foreground text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1 font-light">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-auto">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.94c-.5 0-1-.08-1.5-.22C8 19.83 4 17.1 4 13V5.36a.5.5 0 01.2-.4l7.5-5.63a.5.5 0 01.6 0l7.5 5.63a.5.5 0 01.2.4V13c0 4.1-4 6.83-6.5 7.72-.5.14-1 .22-1.5.22z" /></svg>
            {article.reading_time} دقیقه
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
            {article.views.toLocaleString('fa-IR')}
          </div>
        </div>
      </div>
    </Link>
  );
}