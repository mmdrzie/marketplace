'use client';

import { useParams } from 'next/navigation';
import { useContents } from '@/hooks/useContents';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentSidebar } from '@/components/content/ContentSidebar';
import { FadeIn, StaggerItem } from '@/components/common/MotionDiv';
import { StaggerContainer } from '@/components/common/MotionDiv.client';
import { SkeletonCard } from '@/components/common/Skeleton';
import Link from 'next/link';

export default function EncyclopediaCategoryPage() {
  const params = useParams();
  const categoryId = parseInt(params.id as string, 10);
  const { data: contents, isFetching } = useContents(undefined, { categoryId });

  const displayContents = contents ?? [];

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-16">
          <Link href="/encyclopedia" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            بازگشت به دانشنامه
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="lg:col-span-3">
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {displayContents.map((c) => (
                  <StaggerItem key={c.id}><ContentCard content={c} /></StaggerItem>
                ))}
              </StaggerContainer>

              {isFetching && displayContents.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {!isFetching && displayContents.length === 0 && (
                <div className="glass rounded-3xl border border-border-subtle py-24 flex flex-col items-center justify-center text-center">
                  <p className="font-bold text-foreground mb-1">مطلبی یافت نشد</p>
                  <p className="text-sm text-muted-foreground">در این دسته‌بندی هنوز محتوایی منتشر نشده است.</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ContentSidebar categoryGroup="knowledge" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}