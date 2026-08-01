'use client';

import { useState, useMemo } from 'react';
import { toast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonText } from '@/components/common/Skeleton';
import { GlassSelect } from '@/components/common/GlassSelect';
import {
  useAdminCategories,
  useAdminCreateCategory,
  useAdminUpdateCategory,
  useAdminDeleteCategory,
} from '@/hooks/usePartsV2';
import { CatalogCategoryManager } from '@/components/admin/CatalogCategoryManager';

function countChildren(node: any): number {
  if (!node.children?.length) return 0;
  return node.children.reduce((sum: number, child: any) => sum + 1 + countChildren(child), 0);
}

function findCategoryById(nodes: any[], id: number): any | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findCategoryById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

function flattenTree(nodes: any[], depth = 0): { id: number; name: string; label: string }[] {
  const result: { id: number; name: string; label: string }[] = [];
  for (const node of nodes) {
    const prefix = '\u00A0\u00A0'.repeat(depth * 2) + (depth > 0 ? '\u2014 ' : '');
    result.push({ id: node.id, name: node.name, label: `${prefix}${node.name}` });
    if (node.children?.length) result.push(...flattenTree(node.children, depth + 1));
  }
  return result;
}

function CategoryNode({
  cat,
  depth = 0,
  parentName,
  onEdit,
  onDelete,
}: {
  cat: any;
  depth?: number;
  parentName?: string;
  onEdit: (cat: any) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = cat.children?.length > 0;
  const childCount = countChildren(cat);

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-surface-2 ${
          depth > 0 ? 'mr-6' : ''
        }`}
      >
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="text-muted-foreground shrink-0">
            <svg
              className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="text-foreground font-medium">{cat.name}</span>
        {childCount > 0 && (
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium leading-none">
            {childCount}
          </span>
        )}
        {parentName && (
          <span className="text-[10px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded leading-none">
            {parentName}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline ltr">
          {cat.slug}
        </span>
        <div className="mr-auto flex items-center gap-1">
          <button
            onClick={() => onEdit(cat)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-surface-2"
            title="ویرایش"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(cat.id)}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
            title="حذف"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>
      {hasChildren && open && (
        <div>
          {cat.children.map((child: any) => (
            <CategoryNode
              key={child.id}
              cat={child}
              depth={depth + 1}
              parentName={cat.name}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPartsCategoriesPage() {
  const { data: categories, isLoading, isError, error } = useAdminCategories();
  const createCategory = useAdminCreateCategory();
  const updateCategory = useAdminUpdateCategory();
  const deleteCategory = useAdminDeleteCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    parent_id: '',
    icon: '',
    description: '',
    sort_order: '',
  });

  const [tab, setTab] = useState<'parts' | 'catalog'>('parts');

  const tree = categories ?? [];

  const flatOptions = useMemo(() => {
    const items = flattenTree(tree);
    return [
      { value: '', label: 'بدون والد (دسته اصلی)' },
      ...items.map((item) => ({ value: String(item.id), label: item.label })),
    ];
  }, [tree]);

  const isEditing = !!editingCategory;

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', parent_id: '', icon: '', description: '', sort_order: '' });
    setSlugManuallyEdited(false);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id ? String(cat.parent_id) : '',
      icon: cat.icon || '',
      description: cat.description || '',
      sort_order: cat.sort_order != null ? String(cat.sort_order) : '',
    });
    setSlugManuallyEdited(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const openDeleteDialog = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const slugify = (text: string) =>
    text.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : slugify(name),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug) {
      toast({ type: 'error', title: 'خطا', message: 'نام و slug الزامی هستند' });
      return;
    }

    const payload: Record<string, any> = { name: form.name, slug: form.slug };
    if (form.icon) payload.icon = form.icon;
    if (form.description) payload.description = form.description;
    if (form.sort_order) payload.sort_order = parseInt(form.sort_order);
    if (form.parent_id) payload.parent_id = parseInt(form.parent_id);

    try {
      if (isEditing) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...payload });
        toast({ type: 'success', title: 'دسته ویرایش شد', message: `"${form.name}" با موفقیت به‌روزرسانی شد` });
      } else {
        await createCategory.mutateAsync(payload);
        toast({ type: 'success', title: 'دسته ایجاد شد', message: `"${form.name}" با موفقیت ایجاد شد` });
      }
      closeModal();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'خطایی رخ داد';
      toast({ type: 'error', title: 'خطا', message: msg });
    }
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      await deleteCategory.mutateAsync(deletingId);
      toast({ type: 'success', title: 'دسته حذف شد', message: 'دسته با موفقیت حذف شد' });
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'خطایی در حذف رخ داد';
      toast({ type: 'error', title: 'خطا', message: msg });
    }
  };

  const deletingCategory =
    deletingId !== null ? findCategoryById(tree, deletingId) : null;

  const isPending = createCategory.isPending || updateCategory.isPending;
  const isDeleting = deleteCategory.isPending;

  const tabBar = (
    <div className="flex items-center gap-1 bg-surface/60 border border-border rounded-xl p-1 w-fit">
      <button
        onClick={() => setTab('parts')}
        className={`px-4 py-2 text-sm rounded-lg transition-all ${
          tab === 'parts' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        دسته‌بندی قطعات
      </button>
      <button
        onClick={() => setTab('catalog')}
        className={`px-4 py-2 text-sm rounded-lg transition-all ${
          tab === 'catalog' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        دسته‌بندی کاتالوگ
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {tabBar}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonText key={i} className="h-12" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        {tabBar}
        <EmptyState
          icon="default"
          title="خطا در بارگذاری دسته‌ها"
          description={
            (error as any)?.message ||
            'مشکلی در دریافت اطلاعات پیش آمده است. لطفاً دوباره تلاش کنید.'
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tabBar}
      {tab === 'parts' ? (
        <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">دسته‌بندی قطعات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت دسته‌بندی قطعات یدکی
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          دسته جدید
        </button>
      </div>

      {tree.length === 0 ? (
        <EmptyState
          icon="listing"
          title="دسته‌ای وجود ندارد"
          description="هنوز دسته‌بندی برای قطعات ایجاد نشده است. برای شروع یک دسته جدید بسازید."
          action={
            <button onClick={openCreateModal} className="btn btn-primary">
              ایجاد دسته جدید
            </button>
          }
        />
      ) : (
        <div className="glass rounded-2xl p-4 border border-border-subtle">
          {tree.map((cat: any) => (
            <CategoryNode
              key={cat.id}
              cat={cat}
              onEdit={openEditModal}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={isEditing ? 'ویرایش دسته' : 'ایجاد دسته جدید'}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">نام دسته *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setForm((prev) => ({ ...prev, slug: e.target.value }));
              }}
              required
              dir="ltr"
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">دسته والد</label>
            <GlassSelect
              value={form.parent_id}
              onChange={(val) => setForm((prev) => ({ ...prev, parent_id: val }))}
              options={flatOptions}
              placeholder="انتخاب دسته والد"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">
              آیکون (کلاس SVG)
            </label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, icon: e.target.value }))
              }
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">توضیحات</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">ترتیب نمایش</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sort_order: e.target.value }))
              }
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !form.name || !form.slug}
              className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm"
            >
              {isPending
                ? 'در حال ذخیره...'
                : isEditing
                  ? 'ویرایش'
                  : 'ایجاد'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="حذف دسته"
        message={
          deletingCategory?.children?.length
            ? `آیا از حذف دسته "${deletingCategory?.name}" اطمینان دارید؟ این دسته دارای زیردسته است که همگی حذف خواهند شد.`
            : `آیا از حذف دسته "${deletingCategory?.name}" اطمینان دارید؟`
        }
        confirmLabel="حذف"
        isLoading={isDeleting}
        variant="danger"
      />
        </>
      ) : (
        <CatalogCategoryManager />
      )}
    </div>
  );
}
