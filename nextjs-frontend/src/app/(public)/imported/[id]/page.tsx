import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FEATURES } from '@/lib/features';
import { ImportedBadge } from '@/components/imported/ImportedBadge';
import { CustomsStatusCard } from '@/components/imported/CustomsStatusCard';
import { BrandOriginTag } from '@/components/imported/BrandOriginTag';
import { PriceHistoryChart } from '@/components/common/Charts';
import { generateImportPriceTrend } from '@/lib/importChartData';

async function fetchListing(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/listings/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function ImportedDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!FEATURES.importedVehicles) notFound();
  const { id } = await params;
  const listing = await fetchListing(id);
  
  if (!listing) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="text-center relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2 tracking-tight">آگهی یافت نشد</h1>
          <Link href="/imported" className="btn btn-primary rounded-xl">بازگشت به خودروهای وارداتی</Link>
        </div>
      </div>
    );
  }

  const listingRecord = listing as Record<string, unknown>;
  const attrs = (Array.isArray(listingRecord?.attributes) ? listingRecord.attributes : []) as Array<Record<string, unknown>>;
  const getAttr = (attrId: number): string | undefined => {
    const v = attrs.find((a) => a.attribute_id === attrId)?.value;
    return typeof v === 'string' ? v : undefined;
  };
  const country = getAttr(201);
  const customsStatus = getAttr(203);
  const importYear = getAttr(204);
  const bodyType = getAttr(205);
  const fuelType = getAttr(206);
  const transmission = getAttr(207);
  const driveType = getAttr(208);
  const mileage = getAttr(209);
  const engineCc = getAttr(210);
  const color = getAttr(211);
  const warranty = getAttr(212);
  const chartData = generateImportPriceTrend(typeof listingRecord?.title === 'string' ? listingRecord.title.split(' ')[0] : '');

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* پس‌زمینه داینامیک معماری */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto w-full px-4 py-12 md:py-16 space-y-12">
        
        <div>
          <Link href="/imported" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
            <svg className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            بازگشت به خودروهای وارداتی
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image Placeholder */}
            <div className="glass rounded-3xl p-8 border border-border-subtle shadow-sm flex items-center justify-center aspect-video relative overflow-hidden">
              <svg className="h-24 w-24 text-muted-foreground/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="14" rx="2" /><path d="M21 17v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2" />
              </svg>
              <div className="absolute top-4 right-4 flex gap-2">
                <ImportedBadge country={(country as string) || null} customsStatus={(customsStatus as string) || null} size="md" />
                {listing.is_featured && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-warning/10 text-warning border border-warning/20 uppercase tracking-wider">VIP</span>
                )}
              </div>
            </div>

            {/* Title & Price */}
            <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <BrandOriginTag brand={listing.title} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-foreground mb-2">{listing.title}</h1>
              <p className="text-sm text-muted-foreground mb-6 font-light">{listing.province} — {listing.city} · {listing.published_at}</p>
              <div className="text-3xl font-bold text-foreground tracking-tighter">
                {typeof listing.price === 'number' ? listing.price.toLocaleString('fa-IR') : '—'}
                <span className="text-sm text-muted-foreground font-normal mr-2">تومان</span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                مشخصات فنی
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'نوع بدنه', value: bodyType },
                  { label: 'سوخت', value: fuelType },
                  { label: 'گیربکس', value: transmission },
                  { label: 'محور محرک', value: driveType },
                  { label: 'کارکرد', value: mileage ? `${Number(mileage).toLocaleString('fa-IR')} km` : null },
                  { label: 'حجم موتور', value: engineCc ? `${engineCc} cc` : null },
                  { label: 'رنگ', value: color },
                  { label: 'سال واردات', value: importYear },
                  { label: 'گارانتی', value: warranty === 'true' ? 'دارد' : 'ندارد' },
                ].filter((s) => s.value).map((s) => (
                  <div key={s.label} className="bg-surface-2/30 border border-border-subtle rounded-xl p-4">
                    <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-1">{s.label}</span>
                    <span className="font-bold text-foreground text-sm">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price History Chart */}
            <PriceHistoryChart data={chartData} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-24">
            
            <CustomsStatusCard
              country={country}
              customsStatus={customsStatus}
              chassisNumber={`JTH${String(listing.id).padStart(10, '0')}`}
              engineNumber={`EN${listing.id}${String(listing.id * 7).padStart(5, '0')}`}
            />

            <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full"></span>
                جزئیات آگهی
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                  <span className="text-muted-foreground">شناسه آگهی</span>
                  <span className="font-bold text-foreground font-mono">IMP-{listing.id}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                  <span className="text-muted-foreground">نوع آگهی</span>
                  <span className="font-bold text-foreground">{listing.price_type === 'fixed' ? 'ثابت' : 'قابل مذاکره'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border-subtle">
                  <span className="text-muted-foreground">وضعیت</span>
                  <span className="font-bold text-success">فعال</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">بازدید</span>
                  <span className="font-bold text-foreground">{listing.views?.toLocaleString('fa-IR')}</span>
                </div>
              </div>
            </div>

            <Link
              href="/imported/customs-calc"
              className="flex items-center gap-3 glass rounded-2xl p-4 border border-border-subtle hover:border-primary/40 hover:bg-surface transition-all text-sm font-bold text-foreground group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
              </div>
              <span>محاسبه هزینه‌های واردات</span>
              <svg className="h-4 w-4 mr-auto rotate-180 transition-transform group-hover:-translate-x-1 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>

            <Link
              href={`/search?q=${encodeURIComponent(listing.title)}`}
              className="flex items-center gap-3 glass rounded-2xl p-4 border border-border-subtle hover:border-primary/40 hover:bg-surface transition-all text-sm font-bold text-foreground group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <span>جستجوی آگهی‌های مشابه</span>
              <svg className="h-4 w-4 mr-auto rotate-180 transition-transform group-hover:-translate-x-1 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}