'use client';

import { memo } from 'react';
import { Listing } from '@/types';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
  showStatus?: boolean;
}

const ListingGrid = memo(function ListingGrid({ listings, showStatus = false }: ListingGridProps) {
  // اگر آرایه خالی بود، هیچی رندر نکن
    if (!listings || listings.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        <p className="text-sm font-medium">هیچ آگهی‌ای یافت نشد</p>
        <p className="text-xs mt-1 opacity-60">در حال حاضر هیچ آگهی برای نمایش وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {listings.map((listing, index) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          showStatus={showStatus}
          priority={index === 0}
        />
      ))}
    </div>
  );
});

export { ListingGrid };