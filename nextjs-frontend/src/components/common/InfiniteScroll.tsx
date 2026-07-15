'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { LoadingInline } from './Loading';

interface InfiniteScrollProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  children: ReactNode;
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
  children,
}: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMoreRef.current();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  return (
    <div>
      {children}
      <div ref={observerRef} className="py-4 text-center">
        {loading && <LoadingInline text="در حال بارگذاری..." size="sm" />}
      </div>
    </div>
  );
}
