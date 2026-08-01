'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateContent, useContentTypes, useContentCategories } from '@/hooks/useContents';
import { toast } from '@/components/common/Toast';

export default function NewContentPage() {
  const router = useRouter();
  const { data: types } = useContentTypes();
  const { data: categories } = useContentCategories();
  const createContent = useCreateContent();

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', body: '',
    contentTypeId: 0, categoryId: 0, status: 'draft',
  });
  const [autoSlug, setAutoSlug] = useState(true);

  const handleTitleChange = (title: string) => {
    setForm(prev => ({
      ...prev,
      title,
      slug: autoSlug ? title.replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '') : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.contentTypeId) {
      toast({ type: 'error', title: 'عنوان و نوع محتوا الزامی است' });
      return;
    }
    try {
      const data: Record<string, unknown> = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt || undefined,
        body: form.body || undefined,
        contentTypeId: form.contentTypeId,
        status: form.status,
      };
      if (form.categoryId) data.categoryId = form.categoryId;
      const result = await createContent.mutateAsync(data);
      toast({ type: 'success', title: 'محتوا با موفقیت ایجاد شد' });
      router.push(`/admin/contents/${result.slug}/edit`);
    } catch {
      toast({ type: 'error', title: 'خطا در ایجاد محتوا' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">محتوای جدید</h1>
        <p className="text-sm text-muted-foreground mt-1">ایجاد مقاله، راهنما یا مطلب دانشنامه جدید</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">عنوان</label>
          <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            slug
            <button type="button" onClick={() => setAutoSlug(!autoSlug)}
              className={`mr-2 text-[10px] px-2 py-0.5 rounded-full border ${autoSlug ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted/10 text-muted-foreground border-border'}`}>
              {autoSlug ? 'خودکار' : 'دستی'}
            </button>
          </label>
          <input type="text" value={form.slug} onChange={e => { setForm(p => ({ ...p, slug: e.target.value })); setAutoSlug(false); }}
            className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm font-mono" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">نوع محتوا</label>
            <select value={form.contentTypeId} onChange={e => setForm(p => ({ ...p, contentTypeId: Number(e.target.value) }))}
              className="w-full bg-surface border border-border rounded-xl h-10 px-3 text-foreground outline-none focus:border-primary/50 text-sm" required>
              <option value={0}>انتخاب کنید</option>
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
              <option value="published">منتشر شده</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">خلاصه</label>
          <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={3}
            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary/50 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">متن (HTML)</label>
          <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={15}
            className="w-full bg-surface border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary/50 text-sm font-mono" />
        </div>
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="btn btn-ghost btn-sm rounded-xl">انصراف</button>
          <button type="submit" disabled={createContent.isPending} className="btn btn-primary btn-sm rounded-xl">
            {createContent.isPending ? 'در حال ایجاد...' : 'ایجاد محتوا'}
          </button>
        </div>
      </form>
    </div>
  );
}
