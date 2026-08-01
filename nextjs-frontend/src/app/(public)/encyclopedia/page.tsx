'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useContents, useContentTypes } from '@/hooks/useContents';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentSidebar } from '@/components/content/ContentSidebar';
import { MobileFilterSheet } from '@/components/content/MobileFilterSheet';
import { FadeIn, StaggerItem } from '@/components/common/MotionDiv';
import { StaggerContainer } from '@/components/common/MotionDiv.client';
import { SkeletonCard } from '@/components/common/Skeleton';

const ENCYCLOPEDIA_TYPES = ['guide', 'how_to', 'maintenance', 'glossary', 'tech_spec', 'review', 'comparison', 'buying_guide'];

export default function EncyclopediaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeType = searchParams.get('type') || undefined;
  const activeTag = searchParams.get('tag') || undefined;

  const { data: contents, isFetching } = useContents(activeType);
  const { data: types } = useContentTypes();
  const displayContents = contents ?? [];

  let filtered = displayContents;
  if (activeTag) filtered = filtered.filter((a) => a.tags.some(t => t.slug === activeTag));

  const pinned = filtered.filter((a) => a.isPinned);
  const rest = filtered.filter((a) => !a.isPinned);

  const updateType = (t?: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (t) p.set('type', t); else p.delete('type');
    router.replace(`/encyclopedia?${p.toString()}`);
  };

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] z-0 pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px] z-0 pointer-events-none" style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)' }} />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-16">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full motion-safe:animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }} />
              KNOWLEDGE BASE
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">دانشنامه قطعات</h1>
            <p className="text-muted-foreground text-sm md:text-base font-light max-w-xl">
              راهنماها، مشخصات فنی، واژه‌نامه و آموزش‌های تخصصی قطعات خودرو
            </p>
          </div>

          <div className="hidden lg:flex flex-wrap gap-2 justify-center mb-10">
            <button
              onClick={() => updateType(undefined)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!activeType ? 'font-bold' : 'bg-surface/40 border-border text-muted-foreground'}`}
              style={!activeType
                ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', color: 'var(--color-primary)' }
                : { color: 'var(--color-muted-foreground)' }}
            >
              همه
            </button>
            {(types ?? []).filter(t => ENCYCLOPEDIA_TYPES.includes(t.slug)).map((t) => (
              <button
                key={t.slug}
                onClick={() => updateType(t.slug)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activeType === t.slug ? 'font-bold' : 'bg-surface/40 border-border text-muted-foreground'}`}
                style={activeType === t.slug
                  ? { borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }
                  : { color: 'var(--color-muted-foreground)' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden sticky top-24 z-30 mb-6 w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border font-bold text-foreground text-sm transition-all duration-300"
            style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: 'var(--color-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
            فیلترها
            {(activeType || activeTag) && (
              <span className="min-w-5 h-5 px-1.5 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-background)' }}>
                {[activeType, activeTag].filter(Boolean).length}
              </span>
            )}
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="lg:col-span-3 space-y-10">
              {pinned.length > 0 && (
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pinned.map((c) => (
                    <StaggerItem key={c.id}><ContentCard content={c} /></StaggerItem>
                  ))}
                </StaggerContainer>
              )}

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {rest.map((c) => (
                  <StaggerItem key={c.id}><ContentCard content={c} /></StaggerItem>
                ))}
              </StaggerContainer>

              {isFetching && filtered.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              )}

              {!isFetching && filtered.length === 0 && (
                <div className="glass rounded-3xl border border-border-subtle py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-surface-2/50 border border-border flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
                  </div>
                  <p className="font-bold text-foreground mb-1">مطلبی یافت نشد</p>
                  <p className="text-sm text-muted-foreground mb-6">در این دسته‌بندی هنوز محتوایی منتشر نشده است.</p>
                </div>
              )}
            </div>

            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24">
                <ContentSidebar typeFilter={activeType} categoryGroup="knowledge" />
              </div>
            </div>
          </div>
        </div>

        <MobileFilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="فیلترها">
          <div>
            <h4 className="font-bold text-foreground text-xs mb-3">نوع محتوا</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateType(undefined)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!activeType ? 'font-bold' : 'bg-surface/40 border-border text-muted-foreground'}`}
                style={!activeType
                  ? { backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', color: 'var(--color-primary)' }
                  : { color: 'var(--color-muted-foreground)' }}
              >
                همه
              </button>
              {(types ?? []).filter(t => ENCYCLOPEDIA_TYPES.includes(t.slug)).map((t) => (
                <button
                  key={t.slug}
                  onClick={() => updateType(t.slug)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${activeType === t.slug ? 'font-bold' : 'bg-surface/40 border-border text-muted-foreground'}`}
                  style={activeType === t.slug
                    ? { borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }
                    : { color: 'var(--color-muted-foreground)' }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <ContentSidebar typeFilter={activeType} categoryGroup="knowledge" />
        </MobileFilterSheet>
      </div>
    </FadeIn>
  );
}