import Link from 'next/link';
import { NewsCard } from '@/components/news/NewsCard';
import { FadeIn } from '@/components/common/MotionDiv';
import { SanitizedHtml } from '@/components/common/SanitizedHtml';
import type { Article } from '@/types';

const CATEGORY_STYLES: Record<string, { badge: string }> = {
  market: { badge: 'bg-warning/10 text-warning border-warning/20' },
  guide: { badge: 'bg-primary/10 text-primary border-primary/20' },
  regulation: { badge: 'bg-primary/10 text-primary border-primary/20' },
  announcement: { badge: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/articles/${slug}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return (await res.json()).data;
  } catch { return null; }
}

async function fetchArticles(): Promise<Article[]> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/articles`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return (await res.json()).data;
  } catch { return []; }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  const allArticles = await fetchArticles();

  if (!article) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="text-center relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-surface/40 border border-border flex items-center justify-center mx-auto mb-4 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">مقاله یافت نشد</h1>
          <p className="text-muted-foreground mb-6">مقاله مورد نظر شما وجود ندارد یا حذف شده است.</p>
          <Link href="/news" className="btn btn-primary rounded-xl">بازگشت به اخبار</Link>
        </div>
      </div>
    );
  }

  const related = (allArticles || [])
    .filter((a: Article) => a.slug !== slug && a.category === article.category)
    .slice(0, 3);

  const style = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.guide;

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <article className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
          <Link href="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            بازگشت به اخبار
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${style.badge}`}>
              {article.category_label}
            </span>
            <span className="text-xs text-muted-foreground">{article.published_at}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{article.reading_time} دقیقه مطالعه</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed mb-8 border-r-2 pr-4 border-primary/50 font-light">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-12 pb-8 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {article.author[0]}
              </div>
              <span className="font-medium text-foreground">{article.author}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-muted-foreground" />
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              {article.views.toLocaleString('fa-IR')} بازدید
            </span>
          </div>

          <SanitizedHtml
            html={article.body}
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

          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex flex-wrap gap-2 mb-8">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/news?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-surface/40 border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">این مقاله را به اشتراک بگذارید:</span>
              <div className="flex gap-2">
                {['ایتا', 'بله', 'تلگرام', 'واتساپ'].map((s) => (
                  <button
                    key={s}
                    className="w-10 h-10 rounded-full bg-surface/40 border border-border text-[10px] font-bold text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-surface-2/50 transition-all flex items-center justify-center"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-16 pt-10 border-t border-border">
              <h2 className="text-2xl font-bold tracking-tighter text-foreground mb-6">مقالات مرتبط</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </FadeIn>
  );
}