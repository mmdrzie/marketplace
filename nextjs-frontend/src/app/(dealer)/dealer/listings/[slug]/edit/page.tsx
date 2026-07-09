'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ListingForm } from '@/components/listing/ListingForm';
import { Skeleton } from '@/components/common/Skeleton';
import type { ListingDetail } from '@/types';

export default function DealerEditListingPage() {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">ویرایش آگهی</h1>
          <p className="text-muted-foreground text-sm">در حال بارگذاری...</p>
        </div>
        <div className="glass rounded-3xl p-10">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <h3 className="text-lg font-bold text-foreground mb-2">آگهی یافت نشد</h3>
        <p className="text-sm text-muted-foreground mb-4">آگهی مورد نظر وجود ندارد یا حذف شده است</p>
      </div>
    );
  }

  const initialData = {
    category_id: listing.category_id ?? 0,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">ویرایش آگهی</h1>
        <p className="text-muted-foreground text-sm">در حال ویرایش: {listing.title}</p>
      </div>
      <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl">
        <ListingForm
          listingId={listing.id}
          initialData={initialData}
          redirectPath="/dealer/listings"
        />
      </div>
    </div>
  );
}
