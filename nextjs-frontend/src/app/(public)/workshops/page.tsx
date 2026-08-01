'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useWorkshops, useWorkshopCities } from '@/hooks/useWorkshops';
import { workshopTypeMeta, WorkshopTypeIcon } from '@/components/workshops/workshopMeta';
import { WorkshopCard } from '@/components/workshops/WorkshopCard';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonListings } from '@/components/common/Skeleton';

const TYPE_FILTERS = [
  { value: '', label: 'همه' },
  { value: 'mechanic', label: 'تعمیرکار' },
  { value: 'tuner', label: 'تیونر' },
  { value: 'both', label: 'هر دو' },
];

export default function WorkshopsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: cities } = useWorkshopCities();
  const { data, isLoading, isError } = useWorkshops(
    useMemo(() => ({
      q: debouncedSearch || undefined,
      type: type || undefined,
      city: city || undefined,
    }), [debouncedSearch, type, city]),
  );

  const list = data?.rows ?? [];
  const total = data?.total ?? list.length;

  return (
    <div>
      <header className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-6 backdrop-blur-sm">
          <WorkshopTypeIcon type="both" className="w-3.5 h-3.5 text-accent-purple" />
          باشگاه تعمیرکاران و تیونرها
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-3">تعمیرکاران و تیونرها</h1>
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          معرفی تعمیرگاه‌ها و تیونرهای معتبر با آدرس، تخصص و خدمات — تعمیرگاه خود را جستجو کنید
        </p>
        {!isLoading && !isError && (
          <div className="flex items-center justify-center gap-2 flex-wrap mt-5">
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 border border-border-subtle text-xs text-foreground">
              <WorkshopTypeIcon type="mechanic" className="w-3.5 h-3.5 text-accent-blue" />
              <b>{total.toLocaleString('fa-IR')}</b>
              <span className="text-muted-foreground">تعمیرگاه ثبت‌شده</span>
            </span>
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 border border-border-subtle text-xs text-foreground">
              <WorkshopTypeIcon type="tuner" className="w-3.5 h-3.5 text-accent-indigo" />
              <b>{(cities ?? []).length.toLocaleString('fa-IR')}</b>
              <span className="text-muted-foreground">شهر فعال</span>
            </span>
          </div>
        )}
      </header>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجوی نام، تخصص یا توضیحات..."
              className="w-full bg-surface/60 border border-border rounded-2xl py-3.5 pr-12 pl-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
            />
          </div>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-surface/60 border border-border rounded-2xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm md:w-44"
          >
            <option value="">همه شهرها</option>
            {(cities ?? []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {TYPE_FILTERS.map((f) => {
            const active = type === f.value;
            const meta = f.value ? workshopTypeMeta(f.value) : null;
            return (
              <button
                key={f.value}
                onClick={() => setType(f.value)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl transition-all border ${
                  active
                    ? meta
                      ? `${meta.bg} ${meta.border} ${meta.text}`
                      : 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-surface-2 text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {f.value && <WorkshopTypeIcon type={f.value} className="w-3.5 h-3.5" />}
                {f.label}
              </button>
            );
          })}
          <Link href="/workshops/register" className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            ثبت تعمیرگاه
          </Link>
        </div>

        {isError ? (
          <EmptyState
            icon="search"
            title="خطا در دریافت اطلاعات"
            description="مشکلی پیش آمده است. لطفاً دوباره تلاش کنید."
          />
        ) : isLoading ? (
          <div className="pt-6"><SkeletonListings count={6} /></div>
        ) : list.length === 0 ? (
          <div className="pt-6">
            <EmptyState
              icon="search"
              title="تعمیرکاری یافت نشد"
              description="تعمیرگاه یا تیونری با این مشخصات وجود ندارد."
              action={<Link href="/workshops/register" className="btn btn-primary btn-sm">ثبت تعمیرگاه خود</Link>}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{total.toLocaleString('fa-IR')} تعمیرگاه</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map((w: any, i: number) => (
                <WorkshopCard key={w.user_id} workshop={w} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
