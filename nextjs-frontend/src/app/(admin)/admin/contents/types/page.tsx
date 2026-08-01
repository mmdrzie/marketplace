'use client';

import { useContentTypes } from '@/hooks/useContents';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';

const TYPE_COLORS: Record<string, string> = {
  news: '#3B82F6', guide: '#10B981', how_to: '#8B5CF6',
  maintenance: '#F59E0B', glossary: '#EC4899', tech_spec: '#06B6D4',
  review: '#F97316', comparison: '#6366F1', buying_guide: '#14B8A6',
  faq: '#84CC16',
};

export default function AdminContentTypesPage() {
  const { data: types, isLoading, isError } = useContentTypes();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">انواع محتوا</h1>
        <p className="text-sm text-muted-foreground mt-1">انواع محتوای قابل انتشار در سیستم</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-4 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-sm text-muted-foreground">خطا در بارگذاری انواع محتوا</div>
      ) : !types?.length ? (
        <EmptyState title="نوع محتوایی وجود ندارد" description="هنوز نوع محتوایی تعریف نشده است." icon="default" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {types.map(t => (
            <div key={t.id} className="bg-surface border border-border rounded-xl p-4 hover:border-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: TYPE_COLORS[t.slug] ?? '#6B7280' }}>
                  {t.icon ? t.icon : t.slug[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t.label}</h3>
                  <span className="text-[10px] text-muted-foreground">{t.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
