import { Skeleton, SkeletonCard } from '@/components/common/Skeleton';

export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-14">
          <Skeleton className="h-6 w-40 rounded-full mx-auto mb-4" />
          <Skeleton className="h-10 w-64 rounded-xl mx-auto mb-3" />
          <Skeleton className="h-5 w-96 max-w-full rounded-lg mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
          <div className="hidden lg:block space-y-6">
            <div className="glass rounded-2xl p-5">
              <Skeleton className="h-4 w-24 rounded-lg mb-4" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 rounded-xl mb-1" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
