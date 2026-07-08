'use client';

import { Listing } from '@/types';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
  showStatus?: boolean;
}

export function ListingGrid({ listings, showStatus = false }: ListingGridProps) {
  // اگر آرایه خالی بود، هیچی رندر نکن
  if (!listings || listings.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          showStatus={showStatus}
        />
      ))}
    </div>
  );
}