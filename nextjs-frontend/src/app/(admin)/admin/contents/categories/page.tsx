'use client';

import { useContentCategories } from '@/hooks/useContents';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';

export default function AdminContentCategoriesPage() {
  const { data: categories, isLoading, isError } = useContentCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">دسته‌بندی محتوا</h1>
        <p className="text-sm text-muted-foreground mt-1">مدیریت دسته‌بندی مقالات و دانشنامه</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-sm text-muted-foreground">خطا در بارگذاری دسته‌بندی‌ها</div>
      ) : !categories?.length ? (
        <EmptyState title="دسته‌بندی وجود ندارد" description="هنوز دسته‌بندی برای محتوا تعریف نشده است." icon="default" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="bg-surface border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                {cat.icon && <span className="text-lg">{cat.icon}</span>}
                <h3 className="font-medium text-foreground">{cat.title}</h3>
              </div>
              {cat.description && <p className="text-xs text-muted-foreground line-clamp-2">{cat.description}</p>}
              <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                <span className="bg-surface-2 px-2 py-0.5 rounded-full">{cat.slug}</span>
                {cat.parentId && <span>زیرمجموعه</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
