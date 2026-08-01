'use client';

import { useState, useMemo } from 'react';
import { toast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonText } from '@/components/common/Skeleton';
import { GlassSelect } from '@/components/common/GlassSelect';
import {
  useAdminCatalogCategories,
  useAdminCatalogTypes,
  useAdminCreateCatalogCategory,
  useAdminUpdateCatalogCategory,
  useAdminDeleteCatalogCategory,
  useAdminRestoreCatalogCategory,
} from '@/hooks/useCatalogs';

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

function flattenTree(nodes: any[], depth = 0, excludeId: number | null = null): { id: number; label: string }[] {
  const result: { id: number; label: string }[] = [];
  for (const node of nodes) {
    if (node.id === excludeId) continue;
    const prefix = '\u00A0\u00A0'.repeat(depth * 2) + (depth > 0 ? '\u2014 ' : '');
    const deleted = node.deleted_at ? ' (حذف‌شده)' : '';
    result.push({ id: node.id, label: `${prefix}${node.title}${deleted}` });
    if (node.children?.length) result.push(...flattenTree(node.children, depth + 1, excludeId));
  }
  return result;
}

function CatalogNode({ cat, depth = 0, onEdit, onDelete, onRestore }: {
  cat: any;
  depth?: number;
  onEdit: (cat: any) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = cat.children?.length > 0;
  const isDeleted = !!cat.deleted_at;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-surface-2 ${
          depth > 0 ? 'mr-6' : ''
        } ${isDeleted ? 'opacity-50' : ''}`}
      >
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="text-muted-foreground shrink-0">
            <svg className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="text-foreground font-medium">{cat.title}</span>
        {(cat.part_count || 0) > 0 && (
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium leading-none">
            {(cat.part_count || 0).toLocaleString('fa-IR')}
          </span>
        )}
        <span className="text-[10px] text-muted-foreground bg-surface-2 px-1.5 py-0.5 rounded leading-none">
          {cat.catalog_slug}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline ltr">{cat.slug}</span>
        <div className="mr-auto flex items-center gap-1">
          {isDeleted ? (
            <button
              onClick={() => onRestore(cat.id)}
              className="p-1.5 text-emerald-500 hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10"
              title="بازیابی"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M3.51 15a9 9 0 102.13-9.36L1 10" />
              </svg>
            </button>
          ) : (
            <>
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
                title="حذف (نرم)"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      {hasChildren && open && (
        <div>
          {cat.children.map((child: any) => (
            <CatalogNode key={child.id} cat={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} onRestore={onRestore} />
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_FORM = {
  catalogSlug: '', parentId: '', slug: '', title: '', titleEn: '', description: '', icon: '', sortOrder: '',
};

export function CatalogCategoryManager() {
  const { data: categories, isLoading, isError, error } = useAdminCatalogCategories();
  const { data: catalogTypes } = useAdminCatalogTypes();
  const createCategory = useAdminCreateCatalogCategory();
  const updateCategory = useAdminUpdateCatalogCategory();
  const deleteCategory = useAdminDeleteCatalogCategory();
  const restoreCategory = useAdminRestoreCatalogCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const tree = (categories ?? []) as any[];
  const isEditing = !!editingCategory;

  const parentOptions = useMemo(() => {
    const base = [{ value: '', label: 'بدون والد (ریشه)' }];
    if (!tree.length) return base;
    const filtered = editingCategory
      ? tree.map((root) => flattenTree([root], 0, editingCategory.id)).flat()
      : flattenTree(tree);
    return [...base, ...filtered.map((item) => ({ value: String(item.id), label: item.label }))];
  }, [tree, editingCategory]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setSlugManuallyEdited(false);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setForm({
      catalogSlug: cat.catalog_slug || '',
      parentId: cat.parent_id ? String(cat.parent_id) : '',
      slug: cat.slug,
      title: cat.title,
      titleEn: cat.title_en || '',
      description: cat.description || '',
      icon: cat.icon || '',
      sortOrder: cat.sort_order != null ? String(cat.sort_order) : '',
    });
    setSlugManuallyEdited(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const slugify = (text: string) =>
    text.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({ ...prev, title, slug: slugManuallyEdited ? prev.slug : slugify(title) }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || (!isEditing && !form.catalogSlug)) {
      toast({ type: 'error', title: 'خطا', message: 'عنوان، slug و کاتالوگ الزامی هستند' });
      return;
    }

    const payload: Record<string, any> = {
      slug: form.slug,
      title: form.title,
      titleEn: form.titleEn || undefined,
      description: form.description || undefined,
      icon: form.icon || undefined,
      sortOrder: form.sortOrder ? parseInt(form.sortOrder) : undefined,
      parentId: form.parentId ? parseInt(form.parentId) : null,
    };
    if (!isEditing) payload.catalogSlug = form.catalogSlug;

    try {
      if (isEditing) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...payload });
        toast({ type: 'success', title: 'دسته ویرایش شد', message: `"${form.title}" با موفقیت به‌روزرسانی شد` });
      } else {
        await createCategory.mutateAsync(payload);
        toast({ type: 'success', title: 'دسته ایجاد شد', message: `"${form.title}" با موفقیت ایجاد شد` });
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
      toast({ type: 'success', title: 'دسته حذف شد', message: 'دسته با موفقیت حذف شد (Soft Delete)' });
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'خطایی در حذف رخ داد';
      toast({ type: 'error', title: 'خطا', message: msg });
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreCategory.mutateAsync(id);
      toast({ type: 'success', title: 'دسته بازیابی شد' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'خطایی رخ داد';
      toast({ type: 'error', title: 'خطا', message: msg });
    }
  };

  const deletingCategory = deletingId !== null ? findCategoryById(tree, deletingId) : null;
  const isPending = createCategory.isPending || updateCategory.isPending;
  const isDeleting = deleteCategory.isPending || restoreCategory.isPending;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonText key={i} className="h-12" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="default"
        title="خطا در بارگذاری دسته‌ها"
        description={(error as any)?.message || 'مشکلی در دریافت اطلاعات پیش آمده است.'}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">دسته‌بندی کاتالوگ</h2>
          <p className="text-sm text-muted-foreground mt-1">
            درخت ۳ سطحی (وسیله ← گروه ← نوع) — path/depth توسط Trigger دیتابیس
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          دسته جدید
        </button>
      </div>

      {tree.length === 0 ? (
        <EmptyState
          icon="listing"
          title="دسته‌ای وجود ندارد"
          description="هنوز دسته‌بندی کاتالوگ ایجاد نشده است."
          action={<button onClick={openCreateModal} className="btn btn-primary">ایجاد دسته جدید</button>}
        />
      ) : (
        <div className="glass rounded-2xl p-4 border border-border-subtle">
          {tree.map((cat: any) => (
            <CatalogNode
              key={cat.id}
              cat={cat}
              onEdit={openEditModal}
              onDelete={(id) => { setDeletingId(id); setDeleteDialogOpen(true); }}
              onRestore={handleRestore}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={isEditing ? 'ویرایش دسته کاتالوگ' : 'ایجاد دسته کاتالوگ جدید'}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">کاتالوگ *</label>
            <GlassSelect
              value={form.catalogSlug}
              onChange={(val) => setForm((prev) => ({ ...prev, catalogSlug: val }))}
              options={(catalogTypes || []).map((t: any) => ({ value: t.slug, label: `${t.label} (${t.slug})` }))}
              placeholder="انتخاب کاتالوگ"
              disabled={isEditing}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">دسته والد</label>
            <GlassSelect
              value={form.parentId}
              onChange={(val) => setForm((prev) => ({ ...prev, parentId: val }))}
              options={parentOptions}
              placeholder="انتخاب دسته والد"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">عنوان (فارسی) *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">عنوان انگلیسی</label>
              <input
                type="text"
                value={form.titleEn}
                onChange={(e) => setForm((prev) => ({ ...prev, titleEn: e.target.value }))}
                dir="ltr"
                className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">آیکون</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">ترتیب نمایش</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
                className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">توضیحات</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={closeModal} disabled={isPending} className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm">
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !form.title || !form.slug || (!isEditing && !form.catalogSlug)}
              className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm"
            >
              {isPending ? 'در حال ذخیره...' : isEditing ? 'ویرایش' : 'ایجاد'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeletingId(null); }}
        onConfirm={handleDelete}
        title="حذف دسته کاتالوگ"
        message={`آیا از حذف نرم دسته "${deletingCategory?.title}" اطمینان دارید؟ فرزندان آن نیز حذف می‌شوند.`}
        confirmLabel="حذف"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}
