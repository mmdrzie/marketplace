'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import { ICON_PATHS } from '@/lib/icons';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionDiv';
import type { Category } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';

// --- Minimalist SVG Icons ---
const Icon = ({ d, className = "w-5 h-5" }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

// ICON_PATHS are now imported from '@/lib/icons'

const GUIDE_ITEMS = [
  { icon: ICON_PATHS.car, title: 'خودرو', desc: 'انواع خودروهای سواری، کلاسیک و وارداتی' },
  { icon: ICON_PATHS.truck, title: 'کامیون و تریلی', desc: 'انواع کامیون‌های باری، کشنده و تریلی' },
  { icon: ICON_PATHS.bulldozer, title: 'ماشین‌آلات سنگین', desc: 'لودر، بیل مکانیکی، بولدوزر، جرثقیل و لیفتراک' },
  { icon: ICON_PATHS.tractor, title: 'کشاورزی', desc: 'تراکتور، کمباین و ادوات کشاورزی' },
  { icon: ICON_PATHS.motorcycle, title: 'موتور و دوچرخه', desc: 'انواع موتور و دوچرخه شهری و کوهستان' },
  { icon: ICON_PATHS.generator, title: 'تجهیزات صنعتی', desc: 'انواع دیزل ژنراتور و برق اضطراری' },
  { icon: ICON_PATHS.car, title: 'خودروهای وارداتی', desc: 'خودرو، کامیون و موتورسیکلت خارجی با اطلاعات گمرکی کامل' },
];

export default function CategoriesPage() {
  const { data: apiCategories, isLoading, isError } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => { const res = await api.get('/categories'); return res.data.data; },
    retry: 1,
    staleTime: 60000,
  });

  const categories = apiCategories || (isError ? MOCK_CATEGORIES : null);

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک و معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-16">
          
          {/* هدر صفحه */}
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              EXPLORE CATEGORIES
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-4 leading-tight">
              کاوش در بازارگاه
            </h1>
            <p className="text-lg text-muted-foreground font-light leading-relaxed">
              دسته‌بندی مورد نظر خود را برای دسترسی به هزاران آگهی تخصصی انتخاب کنید
            </p>
          </div>

          {/* گرید دسته‌بندی‌ها */}
          {isLoading && !categories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {(categories as Category[])?.map((cat) => (
                <StaggerItem key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="group relative block h-full bg-surface/40 border border-border rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-primary/40 hover:bg-surface hover:-translate-y-1 backdrop-blur-sm"
                  >
                    {/* افکت درخشش در هاور */}
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
                        <Icon d={ICON_PATHS[cat.slug] || ICON_PATHS.default} className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-1">{cat.name}</h3>
                      {cat.children && cat.children.length > 0 ? (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          {cat.children.length} زیردسته
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">مشاهده آگهی‌ها</p>
                      )}
                      
                      {/* فلش باز شدن در هاور */}
                      <div className="mt-auto pt-4 flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        <span>مشاهده</span>
                        <Icon d="M5 12h14M12 5l7 7-7 7" className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}

          {/* بخش راهنمای مدرن (Bento Style) */}
          <section className="relative pt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-border pb-6">
              <div>
                <span className="text-[11px] text-primary uppercase tracking-widest font-medium block mb-2">GUIDE</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">راهنمای انتخاب دسته‌بندی</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GUIDE_ITEMS.map((item, index) => (
                <div 
                  key={index} 
                  className="group flex items-start gap-4 bg-surface/30 border border-border rounded-2xl p-6 hover:border-primary/40 hover:bg-surface transition-all duration-300"
                >
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon d={item.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </FadeIn>
  );
}