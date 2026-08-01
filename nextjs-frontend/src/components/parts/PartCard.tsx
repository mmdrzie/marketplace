'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';

interface PartShape {
  id: number;
  name: string;
  part_number?: string;
  oem_number?: string;
  category_label?: string;
  price?: number;
  image?: string;
  images?: string[];
  _store_count?: number;
  manufacturer?: string;
}

interface Props {
  part: PartShape;
  index?: number;
}

export function PartCard({ part, index = 0 }: Props) {
  const imageUrl = part.image || part.images?.[0];
  const storeCount = part._store_count ?? 0;

  return (
    <Link
      href={`/parts/${part.id}`}
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
                <circle cx="12" cy="12" r="2.5" />
                <path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

          {/* Category badge on image */}
          {part.category_label && (
            <span className="absolute top-3 right-3 glass-strong text-primary text-[10px] px-2.5 py-1 rounded-full font-medium border border-primary/20 shadow-sm z-10">
              {part.category_label}
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
          {/* Part name */}
          <h3 className="text-sm font-bold text-foreground leading-snug mb-1.5 group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {part.name}
          </h3>

          {/* OEM number */}
          {part.oem_number && (
            <p className="text-[11px] text-muted-foreground font-mono mb-1" dir="ltr">
              <span className="text-[10px] text-muted-foreground/60 font-normal ml-1">OEM:</span>
              {part.oem_number}
            </p>
          )}

          {/* Part number */}
          {part.part_number && (
            <p className="text-[11px] text-muted-foreground mb-1">
              کد: {part.part_number}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-border-subtle">
            <span className="text-sm font-bold text-foreground tracking-tighter">
              {part.price !== undefined ? formatPrice(part.price) : 'استعلام'}
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
