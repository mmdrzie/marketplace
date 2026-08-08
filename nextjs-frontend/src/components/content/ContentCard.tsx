'use client';

import Link from 'next/link';
import type { Content } from '@/types/content';
import { contentTypeThemeColor, difficultyThemeColor } from '@/types/content';
import { use3DTilt } from '@/hooks/use3DTilt';

function getRoute(content: Content): string {
  if (content.contentType.slug === 'news') return `/news/${content.slug}`;
  return `/encyclopedia/${content.slug}`;
}

export function ContentCard({ content, accent }: { content: Content; accent?: string }) {
  const type = content.contentType;
  const c = accent ?? contentTypeThemeColor(type.slug);
  const diffColor = content.difficulty ? difficultyThemeColor(content.difficulty) : null;
  const diffLabel: Record<string, string> = { beginner: 'مبتدی', intermediate: 'متقدم', expert: 'پیشرفته' };
  const tiltRef = use3DTilt({ maxTilt: 5, lerp: 0.08 });

  return (
    <div ref={tiltRef} className="glass-3d group">
      <div className="glass-3d__inner">
        <div className="glass-3d__spotlight"></div>
        <div className="glass-3d__content">
    <Link
      href={getRoute(content)}
      className="group relative block overflow-hidden transition-all duration-300 h-full flex flex-col"
    >
      {/* top accent line */}
      <span className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-l from-transparent via-primary/0 to-transparent transition-all duration-500 group-hover:via-primary/70" />

      {/* cover image */}
      {content.coverImage ? (
        <div className="aspect-[16/9] overflow-hidden relative">
          <img src={content.coverImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="aspect-[16/9] relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${c} 8%, transparent), transparent 60%)` }} />
          <div className="absolute inset-0 opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
          {/* centered glyph */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{ backgroundColor: `color-mix(in srgb, ${c} 12%, transparent)`, borderColor: `color-mix(in srgb, ${c} 25%, transparent)`, color: c }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {type.slug === 'news' ? (
                  <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                ) : (
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
                )}
              </svg>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full p-5 flex-1">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors"
            style={{ backgroundColor: `color-mix(in srgb, ${c} 15%, transparent)`, color: c, borderColor: `color-mix(in srgb, ${c} 30%, transparent)` }}
          >
            {type.label}
          </span>
          {diffColor && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: `color-mix(in srgb, ${diffColor} 10%, transparent)`, color: diffColor, borderColor: `color-mix(in srgb, ${diffColor} 20%, transparent)` }}
            >
              {diffLabel[content.difficulty ?? ''] ?? content.difficulty}
            </span>
          )}
        </div>

        <h3 className="font-bold text-foreground text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {content.title}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1 font-light">
          {content.excerpt}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border-subtle mt-auto">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20.94c-.5 0-1-.08-1.5-.22C8 19.83 4 17.1 4 13V5.36a.5.5 0 01.2-.4l7.5-5.63a.5.5 0 01.6 0l7.5 5.63a.5.5 0 01.2.4V13c0 4.1-4 6.83-6.5 7.72-.5.14-1 .22-1.5.22z" />
              </svg>
              {content.readingTime} دقیقه
            </span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
              </svg>
              {content.views.toLocaleString('fa-IR')}
            </span>
          </div>
          <span className="w-6 h-6 rounded-full border border-border-subtle flex items-center justify-center text-muted-foreground transition-all duration-300 group-hover:border-primary/40 group-hover:text-primary group-hover:bg-primary/10" style={{ transform: 'scaleX(-1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </span>
         </div>
       </div>
     </Link>
        </div>
      </div>
    </div>
  );
}
