'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ListingForm } from '@/components/listing/ListingForm';
import { Skeleton } from '@/components/common/Skeleton';
import type { ListingDetail } from '@/types';

export default function EditListingPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: listing, isLoading } = useQuery({
    queryKey: queryKeys.listings.detail(slug),
    queryFn: async () => {
      const res = await api.get(`/listings/${slug}`);
      return res.data.data as ListingDetail;
    },
    enabled: !!slug,
    retry: 0,
  });

  if (isLoading) {
    return (
      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br bg-gradient-accent items-center justify-center text-white shadow-lg shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">ویرایش آگهی</h1>
            <p className="text-muted-foreground text-sm md:text-base">در حال بارگذاری...</p>
          </div>
        </div>
        <div className="glass rounded-3xl p-8 md:p-10 shadow-2xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="relative z-10 space-y-8">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-destructive/10 items-center justify-center text-destructive shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">آگهی یافت نشد</h1>
            <p className="text-muted-foreground text-sm">آگهی مورد نظر وجود ندارد یا حذف شده است</p>
          </div>
        </div>
      </div>
    );
  }

  const initialData = {
    category_id: listing.category?.id ?? 0,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    price_type: listing.price_type,
    province_id: (listing as any).province_id ?? 0,
    city_id: (listing as any).city_id ?? 0,
    attributes: Object.fromEntries(
      (listing.attributes ?? []).map((a) => [a.name, a.value])
    ),
    images: listing.images ?? [],
  };

  return (
    <div className="relative z-10 space-y-8">
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-gradient-to-br bg-gradient-accent items-center justify-center text-white shadow-lg shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-1">ویرایش آگهی</h1>
          <p className="text-muted-foreground text-sm md:text-base">در حال ویرایش: {listing.title}</p>
        </div>
      </div>
      <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl">
        <ListingForm
          listingId={listing.id}
          initialData={initialData}
          redirectPath="/dashboard/listings"
        />
      </div>
    </div>
  );
}
