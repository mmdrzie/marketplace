'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useArticles } from '@/hooks/useArticles';
import { NewsCard } from '@/components/news/NewsCard';
import { ArticleSidebar } from '@/components/news/ArticleSidebar';
import { FadeIn, StaggerItem } from '@/components/common/MotionDiv';
import { StaggerContainer } from '@/components/common/MotionDiv.client';
import { SkeletonCard } from '@/components/common/Skeleton';

export default function NewsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: articles, isFetching } = useArticles();
  const activeCategory = searchParams.get('category') || undefined;
  const activeTag = searchParams.get('tag') || undefined;

  const updateCategory = (cat?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set('category', cat); else params.delete('category');
    router.replace(`/news?${params.toString()}`);
  };

  const clearFilters = () => {
    router.replace('/news');
  };

  const displayArticles = articles ?? [];
  let filtered = displayArticles;
  if (activeCategory) filtered = filtered.filter((a) => a.category === activeCategory);
  if (activeTag) filtered = filtered.filter((a) => a.tags.includes(activeTag));

  const pinned = filtered.filter((a) => a.is_pinned);
  const rest = filtered.filter((a) => !a.is_pinned);
  const showEmpty = filtered.length === 0 && !isFetching && displayArticles.length > 0;

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-16">
          
          {/* هدر صفحه */}
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
              ARTICLES & NEWS
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">اخبار و مقالات</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light max-w-xl">
              آخرین اخبار بازار خودرو، راهنمای خرید، قوانین و مقررات و مقالات تخصصی
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="lg:col-span-3 space-y-10">
              {pinned.length > 0 && (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pinned.map((article) => (
                    <StaggerItem key={article.id}>
                      <NewsCard article={article} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}

              {rest.length > 0 && (
                <div>
                  {pinned.length > 0 && (
                    <div className="flex items-center gap-3 mb-6">
                      <span className="h-px flex-1 bg-border"></span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">سایر مقالات</span>
                      <span className="h-px flex-1 bg-border"></span>
                    </div>
                  )}
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {rest.map((article) => (
                      <StaggerItem key={article.id}>
                        <NewsCard article={article} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              )}

              {isFetching && filtered.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {showEmpty && (
                <div className="glass rounded-3xl border border-border-subtle py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-2/50 border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  </div>
                  <p className="font-bold text-foreground mb-1">مطلبی یافت نشد</p>
                  <p className="text-sm text-muted-foreground mb-6">در این دسته‌بندی هنوز مقاله‌ای منتشر نشده است.</p>
                  <button onClick={clearFilters} className="btn btn-glass rounded-xl">
                    نمایش همه مقالات
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ArticleSidebar
                  articles={displayArticles}
                  activeCategory={activeCategory}
                  onCategoryChange={updateCategory}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}