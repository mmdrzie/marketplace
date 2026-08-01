'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useContent, useUpdateContent, useContentTypes, useContentCategories } from '@/hooks/useContents';
import { Skeleton } from '@/components/common/Skeleton';
import { toast } from '@/components/common/Toast';

export default function EditContentPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: content, isLoading, isError } = useContent(slug);
  const { data: types } = useContentTypes();
  const { data: categories } = useContentCategories();
  const updateContent = useUpdateContent();

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', body: '',
    contentTypeId: 0, categoryId: 0, status: '',
    coverImage: '', metaTitle: '', metaDescription: '',
  });

  useEffect(() => {
    if (content) {
      setForm({
        title: content.title,
        slug: content.slug,
        excerpt: content.excerpt ?? '',
        body: content.body ?? '',
        contentTypeId: content.contentType.id,
        categoryId: content.category?.id ?? 0,
        status: content.status,
        coverImage: content.coverImage ?? '',
        metaTitle: content.metaTitle ?? '',
        metaDescription: content.metaDescription ?? '',
      });
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    try {
      const data: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) {
        if (v !== '' && v !== 0) data[k] = v;
      }
      if (!data.categoryId) data.categoryId = null;
      await updateContent.mutateAsync({ id: content.id, data });
      toast({ type: 'success', title: 'محتوا با موفقیت به‌روزرسانی شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در به‌روزرسانی محتوا' });
    }
  };

  if (isLoading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
      </div>
    </div>
  );

  if (isError || !content) return (
    <div className="text-center py-12 text-sm text-muted-foreground">محتوا یافت نشد</div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ویرایش محتوا</h1>
        <p className="text-sm text-muted-foreground mt-1">ویرایش «{content.title}»</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">عنوان</label>
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">slug</label>
          <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
            className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm font-mono" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">نوع محتوا</label>
            <select value={form.contentTypeId} onChange={e => setForm(p => ({ ...p, contentTypeId: Number(e.target.value) }))}
              className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm">
              {types?.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">دسته‌بندی</label>
            <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: Number(e.target.value) }))}
              className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm">
              <option value={0}>بدون دسته‌بندی</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">وضعیت</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm">
              <option value="draft">پیش‌نویس</option>
              <option value="review">در انتظار بازبینی</option>
              <option value="published">منتشر شده</option>
              <option value="archived">بایگانی</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">تصویر شاخص (URL)</label>
          <input type="url" value={form.coverImage} onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))}
            className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">خلاصه</label>
          <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={3}
            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary/50 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">متن (HTML)</label>
          <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={20}
            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary/50 text-sm font-mono" />
        </div>

        <hr className="border-border" />
        <p className="text-xs text-muted-foreground">SEO</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Meta Title</label>
            <input type="text" value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))}
              className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Meta Description</label>
            <input type="text" value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))}
              className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm" />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.push('/admin/contents')} className="btn btn-ghost btn-sm rounded-xl">انصراف</button>
          <button type="submit" disabled={updateContent.isPending} className="btn btn-primary btn-sm rounded-xl">
            {updateContent.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </form>
    </div>
  );
}
