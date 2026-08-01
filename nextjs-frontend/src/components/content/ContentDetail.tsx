'use client';

import { SanitizedHtml } from '@/components/common/SanitizedHtml';
import type { Content } from '@/types/content';
import { contentTypeThemeColor } from '@/types/content';
import { DifficultyBadge } from './ContentTypeBadge';
import { BookmarkButton } from './BookmarkButton';

function extractTOC(body: string): { id: string; text: string; level: number }[] {
  if (!body) return [];
  const toc: { id: string; text: string; level: number }[] = [];
  const regex = /<h([2-4])(?:\s+[^>]*)?>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    const id = text.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '');
    toc.push({ id, text, level });
  }
  return toc;
}

export function ContentDetail({ content }: { content: Content }) {
  const toc = extractTOC(content.body);
  const c = contentTypeThemeColor(content.contentType.slug);
  const isLong = toc.length > 2;

  return (
    <article className="relative max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span
          className="text-[11px] font-bold px-3 py-1 rounded-full border"
          style={{ backgroundColor: `color-mix(in srgb, ${c} 15%, transparent)`, color: c, borderColor: `color-mix(in srgb, ${c} 30%, transparent)` }}
        >
          {content.contentType.label}
        </span>
        <DifficultyBadge difficulty={content.difficulty} />
        <span className="text-xs text-muted-foreground">{content.publishedAt}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{content.readingTime} دقیقه مطالعه</span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground leading-tight mb-6">
        {content.title}
      </h1>

      {content.excerpt && (
        <p className="text-muted-foreground text-lg leading-relaxed mb-8 border-r-2 pr-4 border-primary/50 font-light">
          {content.excerpt}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-12 pb-8 border-b border-border">
        {content.author && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
              {content.author.name[0]}
            </div>
            <span className="font-medium text-foreground">{content.author.name}</span>
          </div>
        )}
        {content.author && <span className="w-1 h-1 rounded-full bg-muted-foreground" />}
        <span className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          {content.views.toLocaleString('fa-IR')} بازدید
        </span>
        <BookmarkButton contentId={content.id} />
      </div>

      <div className="flex gap-8">
        {isLong && (
          <nav className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24 space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">فهرست</p>
              {toc.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className={`block text-xs text-muted-foreground hover:text-primary transition-colors ${
                    h.level === 2 ? 'pr-0' : h.level === 3 ? 'pr-3' : 'pr-6'
                  }`}
                >
                  {h.text}
                </a>
              ))}
            </div>
          </nav>
        )}

        <div className="min-w-0 flex-1">
          <SanitizedHtml
            html={content.body}
            className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed space-y-4
              [&_p]:text-muted-foreground [&_p]:leading-8 [&_p:font-light]
              [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4
              [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3
              [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline
              [&_strong]:text-foreground [&_strong]:font-bold
              [&_ul]:text-muted-foreground [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:space-y-2
              [&_ol]:text-muted-foreground [&_ol]:list-decimal [&_ol]:pr-6 [&_ol]:space-y-2
              [&_blockquote]:border-r-2 [&_blockquote]:border-primary/50 [&_blockquote]:pr-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic"
          />
        </div>
      </div>

      {content.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <span
                key={tag.slug}
                className="text-xs px-3 py-1.5 rounded-full bg-surface/40 border border-border text-muted-foreground"
              >
                #{tag.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}