'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('motion-safe:animate-pulse bg-surface/40 border border-border rounded-2xl', className)} />;
}

export function SkeletonText({ className }: SkeletonProps) {
  return <div className={cn('h-4 bg-surface-2 rounded w-full', className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return <Skeleton className={cn('aspect-[4/5]', className)} />;
}

export function SkeletonAvatar({ className }: SkeletonProps) {
  return <div className={cn('w-10 h-10 rounded-full bg-surface-2 motion-safe:animate-pulse shrink-0', className)} />;
}

export function SkeletonListings({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
