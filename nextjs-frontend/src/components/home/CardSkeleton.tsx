import { Skeleton, SkeletonText } from '@/components/common/Skeleton';

export function CardSkeleton() {
  return (
    <div className="bg-surface/40 border border-border rounded-2xl p-6 h-full motion-safe:animate-pulse">
      <Skeleton className="w-12 h-12 rounded-xl mb-4 mx-auto" />
      <SkeletonText className="w-3/4 mx-auto mb-2" />
      <SkeletonText className="w-1/2 mx-auto" />
    </div>
  );
}
