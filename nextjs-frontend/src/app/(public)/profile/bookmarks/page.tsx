'use client';

import { useBookmarks } from '@/hooks/useContents';
import { ContentCard } from '@/components/content/ContentCard';
import { FadeIn } from '@/components/common/MotionDiv';
import { SkeletonCard } from '@/components/common/Skeleton';

export default function BookmarksPage() {
  const { data: bookmarks, isFetching } = useBookmarks();

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-16">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">ذخیره‌شده‌ها</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light max-w-xl">
              مقالات و محتوای ذخیره شده شما
            </p>
          </div>

          {isFetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : !bookmarks?.length ? (
            <div className="glass rounded-3xl border border-border-subtle py-24 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-2/50 border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
              </div>
              <p className="font-bold text-foreground mb-1">موردی ذخیره نشده</p>
              <p className="text-sm text-muted-foreground">هنوز هیچ مقاله یا محتوایی ذخیره نکرده‌اید.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {bookmarks.map((c) => <ContentCard key={c.id} content={c} />)}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}