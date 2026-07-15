'use client';

import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ListingGrid } from './ListingGrid';
import type { Listing } from '@/types';
import { Skeleton, SkeletonListings } from '@/components/common/Skeleton';

interface RelatedListingsProps {
  categoryId: number;
  excludeSlug: string;
}

const RelatedListings = memo(function RelatedListings({ categoryId, excludeSlug }: RelatedListingsProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.listings.related(categoryId),
    queryFn: async () => {
      const res = await api.get('/listings', {
        params: { category_id: categoryId, per_page: 8 },
      });
      return res.data;
    },
    enabled: !!categoryId,
  });

  const filtered = (data?.data as Listing[])?.filter((l) => l.slug !== excludeSlug) || [];

  // اسکلتون لودینگ مدرن
  if (isLoading) {
    return (
      <div className="mt-16">
        <Skeleton className="h-7 w-48 rounded-xl mb-8" />
        <SkeletonListings count={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-16 text-center">
        <p className="text-sm text-muted-foreground mb-3">خطا در بارگذاری آگهی‌های مرتبط</p>
        <button onClick={() => refetch()} className="btn btn-primary btn-sm">تلاش مجدد</button>
      </div>
    );
  }

  if (!filtered.length) return null;

  return (
    <div className="mt-16 pt-12 border-t border-border">
      {/* هدر بخش مرتبط */}
      <div className="mb-8">
        <span className="inline-block text-xs font-bold tracking-widest text-accent-blue uppercase mb-3 bg-accent-blue-bg px-3 py-1 rounded-full border border-accent-blue-border">
          RELATED LISTINGS
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground">آگهی‌های مرتبط</h2>
      </div>

      {/* گرید آگهی‌ها */}
      <ListingGrid listings={filtered} />
    </div>
  );
});

export { RelatedListings };