'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FadeIn } from '@/components/common/MotionDiv';
import type { Category, Attribute } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

type AttributeForm = {
  name: string;
  label: string;
  type: string;
  is_required: boolean;
  is_filterable: boolean;
  unit: string;
  options: string;
};

const EMPTY_FORM: AttributeForm = { name: '', label: '', type: 'text', is_required: false, is_filterable: false, unit: '', options: '' };

export default function AdminAttributesPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingAttr, setEditingAttr] = useState<Attribute | null>(null);
  const [form, setForm] = useState<AttributeForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: queryKeys.admin.categoriesTree,
    queryFn: async () => { const res = await api.get('/categories'); return res.data.data as Category[]; },
    staleTime: 60000,
  });

  const { data: attributes } = useQuery({
    queryKey: queryKeys.admin.attributes(selectedCategory),
    queryFn: async () => {
      const cat = categories?.find((c) => c.id === Number(selectedCategory));
      if (!cat) return [];
      const res = await api.get(`/categories/${cat.slug}/attributes`);
      return res.data.data as Attribute[];
    },
    enabled: !!selectedCategory && !!categories,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.attributes(selectedCategory) });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const cat = categories?.find((c) => c.id === Number(selectedCategory));
      if (!cat) return;
      const payload = { ...form, options: form.options ? form.options.split(',').map((s: string) => s.trim()) : [] };
      await api.post(`/categories/${cat.id}/attributes`, payload);
    },
    onSuccess: () => { invalidate(); setShowForm(false); setForm(EMPTY_FORM); },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingAttr) return;
      const payload = { ...form, options: form.options ? form.options.split(',').map((s: string) => s.trim()) : [] };
      await api.put(`/attributes/${editingAttr.id}`, payload);
    },
    onSuccess: () => { invalidate(); setShowForm(false); setEditingAttr(null); setForm(EMPTY_FORM); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/attributes/${id}`); },
    onSuccess: () => { invalidate(); setDeleteTarget(null); },
  });

  const openCreateForm = () => {
    setEditingAttr(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (attr: Attribute) => {
    setEditingAttr(attr);
    setForm({
      name: attr.name,
      label: attr.label,
      type: attr.type,
      is_required: attr.is_required ?? false,
      is_filterable: attr.is_filterable ?? false,
      unit: attr.unit || '',
      options: attr.options?.join(', ') || '',
    });
    setShowForm(true);
  };

  const typeOptions = [
    { value: 'text', label: 'متن' },
    { value: 'number', label: 'عدد' },
    { value: 'select', label: 'لیست' },
    { value: 'boolean', label: 'بله/خیر' },
  ];

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">مدیریت ویژگی‌های دسته‌بندی</h1>
          {selectedCategory && (
            <button onClick={openCreateForm} className="btn btn-primary btn-sm">
              <SvgIcon><path d="M12 4v16m8-8H4" /></SvgIcon>
              ویژگی جدید
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-surface-2 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-medium text-sm mb-3 text-foreground">دسته‌بندی‌ها</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(String(cat.id))}
                    className={`text-right px-3 py-2 rounded-xl text-sm transition-all ${selectedCategory === String(cat.id) ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-2 hover:bg-surface-3 text-foreground border border-transparent'}`}
                  >
                    {cat.icon && <span className="ml-1">{cat.icon}</span>}
                    {cat.name}
                    {cat.children && cat.children.length > 0 && <span className="text-xs text-muted-foreground mr-1">({cat.children.length})</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h3 className="font-medium text-sm mb-3 text-foreground">
                {selectedCategory ? `ویژگی‌ها (${attributes?.length || 0})` : 'یک دسته‌بندی انتخاب کنید'}
              </h3>
              {attributes && attributes.length > 0 ? (
                <div className="space-y-3">
                  {attributes?.map((attr) => (
                    <div key={attr.id} className="bg-surface-2 rounded-xl p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{attr.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{attr.name}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditForm(attr)} className="p-1.5 rounded-lg hover:bg-surface-3 transition-colors">
                            <SvgIcon className="h-3.5 w-3.5 text-muted-foreground"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></SvgIcon>
                          </button>
                          <button onClick={() => setDeleteTarget({ id: attr.id, name: attr.label })} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                            <SvgIcon className="h-3.5 w-3.5 text-destructive"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></SvgIcon>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${attr.type === 'select' ? 'bg-accent-indigo/10 text-accent-indigo' : attr.type === 'number' ? 'bg-accent-blue/10 text-accent-blue' : attr.type === 'boolean' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                          {attr.type === 'select' ? 'لیست' : attr.type === 'number' ? 'عدد' : attr.type === 'boolean' ? 'بله/خیر' : 'متن'}
                        </span>
                        {attr.is_required && <span className="text-xs text-destructive font-medium">ضروری</span>}
                        {attr.is_filterable && <span className="text-xs text-primary font-medium">قابل فیلتر</span>}
                      </div>
                      {attr.options && attr.options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {attr.options.map((opt) => (
                            <span key={opt} className="text-xs bg-surface border border-border-subtle rounded-md px-2 py-0.5 text-muted-foreground">{opt}</span>
                          ))}
                        </div>
                      )}
                      {attr.unit && <p className="text-xs text-muted-foreground mt-1">واحد: {attr.unit}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">دسته‌بندی انتخاب نشده یا ویژگی ثبت نشده است</p>
              )}
            </div>
          </div>
        )}

        {/* Create/Edit form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditingAttr(null); }}>
            <div className="glass rounded-2xl p-6 w-full max-w-md border border-border-subtle shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-4">{editingAttr ? 'ویرایش ویژگی' : 'ویژگی جدید'}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">نام (لاتین)</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full glass-input rounded-xl px-3 py-2 text-sm" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">برچسب (فارسی)</label>
                    <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full glass-input rounded-xl px-3 py-2 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">نوع</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full glass-input rounded-xl px-3 py-2 text-sm">
                      {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">واحد</label>
                    <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full glass-input rounded-xl px-3 py-2 text-sm" placeholder="متر، کیلوگرم..." />
                  </div>
                </div>
                {form.type === 'select' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">گزینه‌ها (با کاما جدا کنید)</label>
                    <input value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} className="w-full glass-input rounded-xl px-3 py-2 text-sm" placeholder="مثال: قرمز, آبی, سبز" />
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.is_required} onChange={(e) => setForm({ ...form, is_required: e.target.checked })} className="rounded border-border" />
                    ضروری
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={form.is_filterable} onChange={(e) => setForm({ ...form, is_filterable: e.target.checked })} className="rounded border-border" />
                    قابل فیلتر
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setShowForm(false); setEditingAttr(null); }} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
                <button
                  onClick={() => editingAttr ? updateMutation.mutate() : createMutation.mutate()}
                  disabled={!form.name || !form.label || createMutation.isPending || updateMutation.isPending}
                  className="flex-1 py-2.5 btn btn-primary"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? 'در حال ذخیره...' : editingAttr ? 'ویرایش' : 'ثبت ویژگی'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
            <div className="glass rounded-2xl p-6 w-full max-w-sm border border-border-subtle shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <SvgIcon className="h-7 w-7 text-destructive"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></SvgIcon>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">حذف ویژگی</h3>
              <p className="text-sm text-muted-foreground mb-1">آیا از حذف <span className="font-medium text-foreground">{deleteTarget.name}</span> اطمینان دارید؟</p>
              <p className="text-xs text-destructive mb-5">این عمل قابل بازگشت نیست</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 btn btn-danger"
                >
                  {deleteMutation.isPending ? 'در حال حذف...' : 'حذف ویژگی'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
