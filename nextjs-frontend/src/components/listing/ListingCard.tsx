'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Listing } from '@/types';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatRelativeTime } from '@/lib/utils';
import { useCompareStore } from '@/store/compareStore';
import { ShareButton } from '@/components/listing/ShareButton';
import { FavoriteButton } from '@/components/listing/FavoriteButton';
import Image from 'next/image';
import { toast } from '@/components/common/Toast';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  showStatus?: boolean;
}

export function ListingCard({ listing, showStatus = false }: ListingCardProps) {
  const { addItem, removeItem, hasItem } = useCompareStore();

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasItem(listing.id)) {
      removeItem(listing.id);
      toast({ type: 'info', title: 'از مقایسه حذف شد', message: listing.title });
    } else if (useCompareStore.getState().items.length >= 4) {
      toast({ type: 'warning', title: 'حداکثر ۴ مورد', message: 'برای مقایسه موارد بیشتری حذف کنید' });
    } else {
      addItem(listing);
      toast({ type: 'success', title: 'به مقایسه اضافه شد', message: listing.title });
    }
  };

  return (
    <div className="group relative flex flex-col glass rounded-3xl overflow-hidden border border-border-subtle hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
      
      {/* لینک کل کارت (فقط تصویر و متن) */}
      <Link href={`/listings/${listing.slug}`} className="flex flex-col flex-1">
        
        {/* بخش تصویر */}
        <div className="aspect-[4/3] bg-surface-2 relative overflow-hidden">
          {listing.primary_image ? (
            <Image
              src={listing.primary_image}
              alt={listing.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
          
          {/* گرادینت پایین تصویر برای خوانایی بج‌ها و دکمه مشاهده */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none"></div>

          {/* بج‌ها: بالا سمت راست */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-2 items-end">
            {listing.is_featured && (
              <span className="flex items-center gap-1 glass-strong text-warning text-[10px] px-2.5 py-1 rounded-full font-medium border border-warning/20 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                ویژه
              </span>
            )}
            {listing.category?.slug?.startsWith('imported-') && (
              <span className="flex items-center gap-1 glass-strong text-primary text-[10px] px-2.5 py-1 rounded-full font-medium border border-primary/20 shadow-sm">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                وارداتی
              </span>
            )}
            {showStatus && <StatusBadge status={listing.status} />}
          </div>

          {/* تگ مشاهده جزئیات (ظاهر شدن در هاور) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <span className="glass-strong text-primary-foreground text-xs font-medium px-4 py-2 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
              مشاهده جزئیات
              <svg className="h-3.5 w-3.5 -rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </span>
          </div>
        </div>

        {/* بخش محتوا */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-3 min-h-[2.5rem] group-hover:text-primary transition-colors duration-300">
            {listing.title}
          </h3>
          
          {/* متادیتا (مکان و زمان) */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-4 font-light">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{listing.city || listing.province || 'نامشخص'}</span>
            <span className="w-1 h-1 rounded-full bg-border shrink-0"></span>
            <span className="shrink-0">{formatRelativeTime(listing.published_at)}</span>
          </div>

          {/* نمایش قیمت - با mt-auto در پایین بخش متن قفل می‌شود */}
          <div className="mt-auto">
            <div className="text-lg font-bold text-foreground tracking-tighter">
              <PriceDisplay price={listing.price} priceType={listing.price_type} />
            </div>
          </div>
        </div>
      </Link>

      {/* نوار ابزار پایین (اکشن‌ها) */}
      <div className="flex items-center justify-between p-3 border-t border-border-subtle bg-surface/20 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <FavoriteButton listingId={listing.id} />
          
          <button
            onClick={toggleCompare}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border',
              hasItem(listing.id)
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-transparent text-muted-foreground hover:bg-primary/10 hover:border-primary/20 hover:text-primary'
            )}
            title={hasItem(listing.id) ? 'حذف از مقایسه' : 'افزودن به مقایسه'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="6" height="18" rx="1" />
              <rect x="16" y="3" width="6" height="18" rx="1" />
              {hasItem(listing.id) && <line x1="8" y1="12" x2="16" y2="12" />}
            </svg>
          </button>

          <ShareButton title={listing.title} url={`/listings/${listing.slug}`} />
        </div>
        
        {/* دسته‌بندی در گوشه پایین */}
        {listing.category?.name && (
          <span className="text-[10px] text-muted-foreground font-light uppercase tracking-wider pr-2">
            {listing.category.name}
          </span>
        )}
      </div>
    </div>
  );
}