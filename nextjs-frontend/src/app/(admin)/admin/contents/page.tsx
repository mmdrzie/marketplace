'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useContents, useDeleteContent, useContentTypes } from '@/hooks/useContents';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton, SkeletonText } from '@/components/common/Skeleton';
import { Modal } from '@/components/common/Modal';
import { PersianDate } from '@/components/common/PersianDate';
import { toast } from '@/components/common/Toast';
import type { Content } from '@/types/content';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-warning/10 text-warning border-warning/20',
  review: 'bg-info/10 text-info border-info/20',
  scheduled: 'bg-accent/10 text-accent border-accent/20',
  published: 'bg-success/10 text-success border-success/20',
  archived: 'bg-muted/10 text-muted-foreground border-border',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'پیش‌نویس',
  review: 'در انتظار بازبینی',
  scheduled: 'زمان‌بندی شده',
  published: 'منتشر شده',
  archived: 'بایگانی',
};

const FILTER_TABS = [
  { value: '', label: 'همه' },
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'published', label: 'منتشر شده' },
  { value: 'archived', label: 'بایگانی' },
];

export default function AdminContentsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Content | null>(null);

  const { data: contents, isLoading, isError } = useContents(typeFilter || undefined, { status: statusFilter || undefined, search: search || undefined });
  const { data: types } = useContentTypes();
  const deleteContent = useDeleteContent();

  const filtered = useMemo(() => {
    let list = contents ?? [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.slug.includes(q));
    }
    return list;
  }, [contents, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContent.mutateAsync(deleteTarget.id);
      toast({ type: 'success', title: 'محتوا با موفقیت حذف شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در حذف محتوا' });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مدیریت محتوا</h1>
          <p className="text-sm text-muted-foreground mt-1">همه مقالات، راهنماها و مطالب دانشنامه</p>
        </div>
        <Link href="/admin/contents/new" className="btn btn-primary btn-sm rounded-xl">افزودن محتوا</Link>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-surface border border-border rounded-xl p-1">
          {FILTER_TABS.map(tab => (
            <button key={tab.value} onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === tab.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-surface border border-border rounded-xl text-xs h-9 px-3 text-foreground outline-none focus:border-primary/50">
          <option value="">همه انواع</option>
          {types?.map(t => <option key={t.id} value={t.slug}>{t.label}</option>)}
        </select>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجو..."
          className="bg-surface border border-border rounded-xl text-xs h-9 px-3 text-foreground outline-none focus:border-primary/50 w-48" />
      </div>

      {/* list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4">
              <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-sm text-muted-foreground">خطا در بارگذاری محتوا</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="موردی یافت نشد" description="هنوز محتوایی اضافه نشده است." icon="default" />
      ) : (
        <div className="space-y-2">
          {filtered.map((content: Content) => (
            <div key={content.id} className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:border-primary/20 transition-colors group">
              {content.coverImage && (
                <img src={content.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-medium">{content.contentType.label}</span>
                  <h3 className="font-medium text-foreground truncate">{content.title}</h3>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  {content.author && <span>{content.author.name}</span>}
                  <PersianDate date={content.createdAt} />
                  <span>{content.views} بازدید</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-1 rounded-full border ${STATUS_STYLES[content.status] ?? 'bg-muted/10 text-muted-foreground'}`}>
                  {STATUS_LABELS[content.status] ?? content.status}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/contents/${content.slug}/edit`} className="btn btn-ghost btn-xs rounded-lg">ویرایش</Link>
                  <button onClick={() => setDeleteTarget(content)} className="btn btn-ghost btn-xs rounded-lg text-destructive">حذف</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="حذف محتوا">
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold">حذف محتوا</h3>
          <p className="text-sm text-muted-foreground">آیا از حذف «{deleteTarget?.title}» اطمینان دارید؟</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteTarget(null)} className="btn btn-ghost btn-sm rounded-xl">انصراف</button>
            <button onClick={handleDelete} className="btn btn-destructive btn-sm rounded-xl">حذف</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
