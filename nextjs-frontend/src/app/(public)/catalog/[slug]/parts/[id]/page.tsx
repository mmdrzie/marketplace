'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCatalog, useCatalogPart, useCatalogPartStores } from '@/hooks/useCatalogs';
import { CatalogSpecsTable } from '@/components/catalog/CatalogSpecsTable';
import { StorePriceTable } from '@/components/parts/StorePriceTable';
import { LoadingPage } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';

export default function CatalogPartDetailPage() {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const { data: catalog } = useCatalog(slug);
  const { data: part, isLoading, isError } = useCatalogPart(slug, id);
  const { data: stores } = useCatalogPartStores(slug, id);

  const catalogLabel = catalog?.label || slug;

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="خطا در دریافت اطلاعات"
          description="مشکلی پیش آمده، لطفاً دوباره تلاش کنید."
          icon="search"
          action={
            <Link href={`/catalog/${slug}`} className="text-sm text-primary hover:underline">
              بازگشت به کاتالوگ {catalogLabel}
            </Link>
          }
        />
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="قطعه یافت نشد"
          description="قطعه مورد نظر وجود ندارد یا حذف شده است."
          icon="search"
          action={
            <Link href={`/catalog/${slug}`} className="text-sm text-primary hover:underline">
              بازگشت به کاتالوگ {catalogLabel}
            </Link>
          }
        />
      </div>
    );
  }

  const imageSrc = part.image || part.images?.[0];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/catalog/${slug}`} className="hover:text-primary transition-colors">کاتالوگ {catalogLabel}</Link>
        <span>/</span>
        <Link href={`/catalog/${slug}/parts`} className="hover:text-primary transition-colors">همه قطعات</Link>
        <span>/</span>
        <span className="text-foreground truncate">{part.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Image */}
        <div className="rounded-2xl border border-border-subtle bg-surface-2 p-8 flex items-center justify-center aspect-square">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={part.name}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <svg className="h-20 w-20 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
              </svg>
              <span className="text-xs">تصویری ثبت نشده</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {part.category_name && (
                <span className="inline-block text-xs font-bold tracking-widest uppercase border px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20">
                  {part.category_name}
                </span>
              )}
              {part.part_type_label && (
                <span className="inline-block text-xs font-bold border px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border-violet-500/20">
                  {part.part_type_label}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{part.name}</h1>
          </div>

          <div className="rounded-2xl border border-border-subtle bg-surface-2 p-5 space-y-4">
            {part.part_number && (
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                <span className="text-sm text-muted-foreground">کد قطعه</span>
                <span className="text-sm font-bold text-foreground font-mono">{part.part_number}</span>
              </div>
            )}
            {part.oem_number && (
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                <span className="text-sm text-muted-foreground">OEM</span>
                <span className="text-sm font-bold text-foreground font-mono">{part.oem_number}</span>
              </div>
            )}
            {part.manufacturer && (
              <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                <span className="text-sm text-muted-foreground">تولیدکننده</span>
                <span className="text-sm font-bold text-foreground">{part.manufacturer}</span>
              </div>
            )}
            {part.warranty && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">گارانتی</span>
                <span className="text-sm font-bold text-foreground">{part.warranty}</span>
              </div>
            )}
          </div>

          {part.description && (
            <div className="rounded-2xl border border-border-subtle bg-surface-2 p-5">
              <h3 className="text-sm font-bold text-foreground mb-2">توضیحات</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{part.description}</p>
            </div>
          )}

          {part.specs && part.specs.length > 0 && (
            <CatalogSpecsTable specs={part.specs[0]?.specs} />
          )}

          {part.compatible_models && part.compatible_models.length > 0 && (
            <div className="rounded-2xl border border-border-subtle bg-surface-2 p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">مدل‌های سازگار</h3>
              <div className="flex flex-wrap gap-2">
                {part.compatible_models.map((cm: any) => (
                  <span key={cm.id} className="text-xs bg-background border border-border px-3 py-1 rounded-full text-foreground">
                    {cm.brand_name} {cm.model_name ? `- ${cm.model_name}` : ''}
                    {cm.year_from > 0 || cm.year_to > 0 ? ` (${cm.year_from || '...'} - ${cm.year_to || '...'})` : ''}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <a
            href="#stores-section"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            استعلام قیمت از فروشندگان
          </a>
        </div>
      </div>

      {/* Stores section */}
      <div id="stores-section" className="rounded-2xl border border-border-subtle bg-surface-2 p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">فروشندگان این قطعه</h2>
        <StorePriceTable stores={stores || []} />
      </div>
    </div>
  );
}
