'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

interface CatalogPartShape {
  id: number;
  name: string;
  part_number?: string;
  oem_number?: string;
  category_name?: string;
  min_price?: number;
  image?: string;
  images?: string[];
  _store_count?: number;
  store_count?: number;
  part_type_label?: string;
  part_type_color?: string;
  part_type_slug?: string;
}

interface Props {
  part: CatalogPartShape;
  catalogSlug?: string;
  index?: number;
}

const PART_TYPE_STYLES: Record<string, string> = {
  oem: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  aftermarket: 'bg-primary/10 text-primary border-primary/20',
  performance: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  racing: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  universal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export function CatalogPartCard({ part, catalogSlug = 'tuning', index = 0 }: Props) {
  const imageUrl = part.image || part.images?.[0];
  const storeCount = part._store_count ?? part.store_count ?? 0;
  const typeStyle = PART_TYPE_STYLES[part.part_type_slug || ''] || 'bg-primary/10 text-primary border-primary/20';

  return (
    <Link
      href={`/catalog/${catalogSlug}/parts/${part.id}`}
      className="block group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'both' }}
    >
      <div
        className={cn(
          'glass rounded-3xl overflow-hidden border border-border-subtle',
          'hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5',
          'transition-all duration-300 h-full flex flex-col',
        )}
      >
        {/* Image / Placeholder with gradient overlay */}
        <div className="aspect-[4/3] bg-surface-2 relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={part.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/20">
              <svg className="h-14 w-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

          {/* Part type badge on image */}
          {part.part_type_label && (
            <span className={cn('absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-medium border shadow-sm z-10', typeStyle)}>
              {part.part_type_label}
            </span>
          )}

          {/* Category badge on image */}
          {part.category_name && (
            <span className="absolute top-3 left-3 glass-strong text-muted-foreground text-[10px] px-2.5 py-1 rounded-full font-medium border border-white/10 shadow-sm z-10">
              {part.category_name}
            </span>
          )}

          {/* Hover overlay text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="glass-strong text-primary-foreground text-xs font-medium px-4 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
              مشاهده جزئیات
              <svg className="h-3.5 w-3.5 -rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {part.name}
          </h3>

          {part.oem_number && (
            <p className="text-[11px] text-muted-foreground font-mono mb-1" dir="ltr">
              <span className="text-[10px] text-muted-foreground/60 font-normal ml-1">OEM:</span>
              {part.oem_number}
            </p>
          )}

          {part.part_number && (
            <p className="text-[11px] text-muted-foreground mb-1">
              کد: {part.part_number}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-border-subtle">
            <span className="text-sm font-bold text-foreground tracking-tighter">
              {part.min_price !== undefined && part.min_price !== null ? formatPrice(part.min_price) : 'استعلام'}
            </span>
            {storeCount > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2.5 py-1 rounded-full">
                {storeCount.toLocaleString('fa-IR')} فروشگاه
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
