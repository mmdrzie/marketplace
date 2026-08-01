'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { usePartsCategory, useParts } from '@/hooks/usePartsV2';
import { PartsCategoryTree } from '@/components/parts/PartsCategoryTree';
import { PartCard } from '@/components/parts/PartCard';

export default function PartsCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: category, isLoading: catLoading } = usePartsCategory(slug);
  const { data: allCategories } = usePartsCategory('');
  const catList = useMemo(() => (allCategories && Array.isArray(allCategories) ? allCategories : []), [allCategories]);

  const apiParams = useMemo(() => ({ category: slug }), [slug]);
  const { data: parts, isLoading: partsLoading } = useParts(apiParams);
  const partList = useMemo(() => parts ?? [], [parts]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-24">
        <div className="mb-6">
          <Link href="/parts" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
            <svg className="h-4 w-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            همه قطعات
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">{category?.name || slug}</h1>
          {category?.description && <p className="text-sm text-muted-foreground mt-2">{category.description}</p>}

          {category?.children?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {category.children.map((child: any) => (
                <Link
                  key={child.id}
                  href={`/parts/categories/${child.slug}`}
                  className="px-3 py-1.5 text-xs rounded-full bg-surface-2 border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <aside className="w-full md:w-64 shrink-0">
            <div className="glass rounded-2xl p-4 border border-border-subtle sticky top-24">
              <h3 className="text-xs font-bold text-muted-foreground mb-3">دسته‌بندی قطعات</h3>
              <PartsCategoryTree categories={catList} activeSlug={slug} />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            {partsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-4 border border-border-subtle motion-safe:animate-pulse">
                    <div className="w-full aspect-square bg-surface-2 rounded-xl mb-3" />
                    <div className="h-3 w-16 bg-surface-2 rounded-full mb-2" />
                    <div className="h-4 w-3/4 bg-surface-2 rounded-lg mb-1" />
                    <div className="h-4 w-1/3 bg-surface-2 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : partList.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">هیچ قطعه‌ای در این دسته یافت نشد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {partList.map((part: any, i: number) => (
                  <PartCard key={part.id} part={part} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
