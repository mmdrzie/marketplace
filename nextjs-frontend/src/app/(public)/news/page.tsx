'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useContents } from '@/hooks/useContents';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentSidebar } from '@/components/content/ContentSidebar';
import { MobileFilterSheet } from '@/components/content/MobileFilterSheet';
import { FadeIn, StaggerItem } from '@/components/common/MotionDiv';
import { StaggerContainer } from '@/components/common/MotionDiv.client';
import { SkeletonCard } from '@/components/common/Skeleton';

export default function NewsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeCategory = searchParams.get('category') || undefined;
  const activeTag = searchParams.get('tag') || undefined;

  const { data: contents, isFetching } = useContents('news');

  const displayContents = contents ?? [];
  let filtered = displayContents;
  if (activeCategory) filtered = filtered.filter((a) => a.category?.slug === activeCategory);
  if (activeTag) filtered = filtered.filter((a) => a.tags.some(t => t.slug === activeTag));

  const pinned = filtered.filter((a) => a.isPinned);
  const rest = filtered.filter((a) => !a.isPinned);
  const showEmpty = filtered.length === 0 && !isFetching && displayContents.length > 0;

  const updateCategory = (cat?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set('category', cat); else params.delete('category');
    router.replace(`/news?${params.toString()}`);
  };

  const clearFilters = () => router.replace('/news');

  return (
    <FadeIn>
      <div className="relative min-h-screen text-foreground overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-16">
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

          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden sticky top-24 z-30 mb-6 w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border font-bold text-foreground text-sm transition-all duration-300"
            style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: 'var(--color-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
            فیلترها
            {(activeCategory || activeTag) && (
              <span className="min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }}>
                {[activeCategory, activeTag].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="lg:col-span-3 space-y-10">
              {pinned.length > 0 && (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pinned.map((article) => (
                    <StaggerItem key={article.id}>
                      <ContentCard content={article} />
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
                        <ContentCard content={article} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              )}

              {isFetching && filtered.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {showEmpty && (
                <div className="glass rounded-3xl border border-border-subtle py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-2/50 border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  </div>
                  <p className="font-bold text-foreground mb-1">مطلبی یافت نشد</p>
                  <p className="text-sm text-muted-foreground mb-6">در این دسته‌بندی هنوز مقاله‌ای منتشر نشده است.</p>
                  <button onClick={clearFilters} className="btn btn-glass rounded-xl">نمایش همه مقالات</button>
                </div>
              )}
            </div>

            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <ContentSidebar typeFilter="news" activeCategory={activeCategory} onCategoryChange={updateCategory} categoryGroup="news" />
              </div>
            </div>
          </div>
        </div>

        <MobileFilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="فیلترها">
          <ContentSidebar typeFilter="news" activeCategory={activeCategory} onCategoryChange={updateCategory} categoryGroup="news" />
        </MobileFilterSheet>
      </div>
    </FadeIn>
  );
}