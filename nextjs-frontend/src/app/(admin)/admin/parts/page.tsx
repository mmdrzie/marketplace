'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Loading } from '@/components/common/Loading';
import { Skeleton, SkeletonText } from '@/components/common/Skeleton';
import { useAdminParts, useAdminCreatePart, useAdminUpdatePart, useAdminDeletePart } from '@/hooks/usePartsV2';
import { useAdminPartTypes, useAdminCatalogTypes, useAdminCatalogCategories, useAdminSetPartSpecs } from '@/hooks/useCatalogs';

const EMPTY_FORM = {
  name: '', partNumber: '', oemNumber: '', price: '', description: '', manufacturer: '',
};

const EMPTY_SPECS = {
  enabled: false,
  stage: '', hpMin: '', hpMax: '', tqMin: '', tqMax: '', boost: '',
  ecu: false, proInstall: false, notes: '',
};

export default function AdminPartsPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tab, setTab] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [partTypeId, setPartTypeId] = useState<string>('');
  const [catRootId, setCatRootId] = useState<string>('');
  const [catGroupId, setCatGroupId] = useState<string>('');
  const [catTypeId, setCatTypeId] = useState<string>('');
  const [specs, setSpecs] = useState(EMPTY_SPECS);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: partTypes } = useAdminPartTypes();
  const { data: catalogTypes } = useAdminCatalogTypes();
  const { data: catalogCategories } = useAdminCatalogCategories('tuning');

  const { data: parts, isLoading, isError, refetch } = useAdminParts(debouncedSearch || undefined, tab || undefined);
  const createPart = useAdminCreatePart();
  const updatePart = useAdminUpdatePart();
  const deletePart = useAdminDeletePart();
  const setPartSpecs = useAdminSetPartSpecs();

  const list = parts ?? [];

  const typeLabelById = useMemo(() => Object.fromEntries((partTypes || []).map((t: any) => [String(t.id), t])), [partTypes]);
  const tuningType = useMemo(() => (catalogTypes || []).find((t: any) => t.slug === 'tuning'), [catalogTypes]);

  const roots = useMemo(() => (catalogCategories || []) as any[], [catalogCategories]);
  const groups = useMemo(() => roots.find((r) => String(r.id) === catRootId)?.children || [], [roots, catRootId]);
  const types = useMemo(() => groups.find((g: any) => String(g.id) === catGroupId)?.children || [], [groups, catGroupId]);

  const openCreateModal = () => {
    setEditingPart(null);
    setForm(EMPTY_FORM);
    setPartTypeId('');
    setCatRootId(''); setCatGroupId(''); setCatTypeId('');
    setSpecs(EMPTY_SPECS);
    setModalOpen(true);
  };

  const openEditModal = (part: any) => {
    setEditingPart(part);
    setForm({
      name: part.name || '',
      partNumber: part.part_number || '',
      oemNumber: part.oem_number || '',
      price: part.price != null ? String(part.price) : '',
      description: part.description || '',
      manufacturer: part.manufacturer || '',
    });
    setPartTypeId(part.part_type_id ? String(part.part_type_id) : '');
    setCatRootId(''); setCatGroupId(''); setCatTypeId('');
    if (part.catalog_category_path) {
      const segments = part.catalog_category_path.split('/').filter(Boolean);
      if (segments.length >= 1) setCatRootId(segments[0]);
      if (segments.length >= 2) setCatGroupId(segments[1]);
      if (segments.length >= 3) setCatTypeId(segments[2]);
    }
    setSpecs(EMPTY_SPECS);
    setModalOpen(true);
  };

  const buildSpecsPayload = () => {
    if (!specs.enabled) return null;
    const payload: Record<string, any> = {
      schema_version: 1,
      stage_label: specs.stage,
      dyno_charts: [],
      ecu_required: specs.ecu,
      professional_install: specs.proInstall,
      notes: specs.notes,
    };
    const hpMin = specs.hpMin ? Number(specs.hpMin) : undefined;
    const hpMax = specs.hpMax ? Number(specs.hpMax) : undefined;
    if (hpMin !== undefined || hpMax !== undefined) payload.horsepower_gain = { min: hpMin, max: hpMax };
    const tqMin = specs.tqMin ? Number(specs.tqMin) : undefined;
    const tqMax = specs.tqMax ? Number(specs.tqMax) : undefined;
    if (tqMin !== undefined || tqMax !== undefined) payload.torque_gain = { min: tqMin, max: tqMax };
    if (specs.boost) payload.performance_metrics = { boost: specs.boost };
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, any> = {
        name: form.name,
        partNumber: form.partNumber || undefined,
        oemNumber: form.oemNumber || undefined,
        description: form.description || undefined,
        manufacturer: form.manufacturer || undefined,
        partTypeId: partTypeId ? Number(partTypeId) : undefined,
        catalogCategoryId: Number(catTypeId || catGroupId || catRootId) || undefined,
      };
      if (form.price) payload.price = Number(form.price);

      const specsPayload = buildSpecsPayload();

      if (editingPart) {
        const updatePayload: Record<string, any> = {
          name: payload.name,
          description: payload.description,
          manufacturer: payload.manufacturer,
          part_type_id: payload.partTypeId,
          catalog_category_id: payload.catalogCategoryId,
        };
        if (payload.partNumber) updatePayload.part_number = payload.partNumber;
        if (payload.oemNumber) updatePayload.oem_number = payload.oemNumber;
        if (payload.price !== undefined) updatePayload.price = payload.price;
        await updatePart.mutateAsync({ id: editingPart.id, ...updatePayload });
        if (specsPayload && tuningType) {
          await setPartSpecs.mutateAsync({ id: editingPart.id, catalogTypeId: tuningType.id, specs: specsPayload });
        }
        toast({ type: 'success', title: 'قطعه با موفقیت به‌روزرسانی شد' });
      } else {
        if (specsPayload && tuningType) {
          payload.specs = { catalogTypeId: tuningType.id, specs: specsPayload };
        }
        await createPart.mutateAsync(payload);
        toast({ type: 'success', title: 'قطعه با موفقیت ایجاد شد' });
      }
      setModalOpen(false);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'خطا',
        message: err?.response?.data?.message || err?.message || 'عملیات ناموفق بود',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePart.mutateAsync(deleteTarget.id);
      toast({ type: 'success', title: 'قطعه با موفقیت حذف شد' });
      setDeleteTarget(null);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'خطا',
        message: err?.response?.data?.message || err?.message || 'حذف ناموفق بود',
      });
    }
  };

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">کاتالوگ قطعات</h1>
            <p className="text-sm text-muted-foreground mt-1">مدیریت قطعات در کاتالوگ اصلی</p>
          </div>
        </div>
        <EmptyState
          icon="default"
          title="خطا در بارگذاری"
          description="مشکلی در دریافت اطلاعات پیش آمده است"
          action={<button onClick={() => refetch()} className="btn btn-primary">تلاش مجدد</button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">کاتالوگ قطعات</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت قطعات در کاتالوگ اصلی</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          قطعه جدید
        </button>
      </div>

      {/* Part type tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
            tab === null ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground border-border hover:text-foreground'
          }`}
        >
          همه
        </button>
        {(partTypes || []).map((t: any) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              tab === t.id ? 'bg-primary/10 text-primary border-primary/20' : 'text-muted-foreground border-border hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="جستجو در قطعات..."
          className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
        />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingPart ? 'ویرایش قطعه' : 'ایجاد قطعه جدید'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="نام قطعه *"
              required
              className="px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground"
            />
            <input
              type="text"
              value={form.partNumber}
              onChange={(e) => setForm({ ...form, partNumber: e.target.value })}
              placeholder="شماره فنی"
              className="px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground"
            />
            <input
              type="text"
              value={form.oemNumber}
              onChange={(e) => setForm({ ...form, oemNumber: e.target.value })}
              placeholder="OEM"
              className="px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground"
            />
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="قیمت"
              className="px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground"
            />
            <input
              type="text"
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              placeholder="تولیدکننده"
              className="px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground"
            />
            <select
              value={partTypeId}
              onChange={(e) => setPartTypeId(e.target.value)}
              className="px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground"
            >
              <option value="">نوع قطعه (بدون نوع)</option>
              {(partTypes || []).map((t: any) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="توضیحات"
            rows={2}
            className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground resize-none"
          />

          {/* 3-level catalog category selector */}
          <div className="rounded-xl border border-border bg-surface/30 p-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground">دسته‌بندی کاتالوگ (تیونینگ)</p>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={catRootId}
                onChange={(e) => { setCatRootId(e.target.value); setCatGroupId(''); setCatTypeId(''); }}
                className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground"
              >
                <option value="">وسیله نقلیه</option>
                {roots.map((r: any) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
              <select
                value={catGroupId}
                onChange={(e) => { setCatGroupId(e.target.value); setCatTypeId(''); }}
                disabled={!catRootId}
                className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground disabled:opacity-40"
              >
                <option value="">گروه</option>
                {groups.map((g: any) => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
              <select
                value={catTypeId}
                onChange={(e) => setCatTypeId(e.target.value)}
                disabled={!catGroupId}
                className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground disabled:opacity-40"
              >
                <option value="">نوع قطعه</option>
                {types.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
          </div>

          {/* Specs editor */}
          <div className="rounded-xl border border-border bg-surface/30 p-4 space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={specs.enabled}
                onChange={(e) => setSpecs({ ...specs, enabled: e.target.checked })}
                className="accent-primary"
              />
              ثبت مشخصات فنی تیونینگ (part_specs)
            </label>
            {specs.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={specs.stage}
                  onChange={(e) => setSpecs({ ...specs, stage: e.target.value })}
                  placeholder="Stage (مثلاً Stage 1)"
                  className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground"
                />
                <input
                  type="text"
                  value={specs.boost}
                  onChange={(e) => setSpecs({ ...specs, boost: e.target.value })}
                  placeholder="بوست (مثلاً 1.2 bar)"
                  className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground"
                />
                <input
                  type="number"
                  value={specs.hpMin}
                  onChange={(e) => setSpecs({ ...specs, hpMin: e.target.value })}
                  placeholder="افزایش قدرت از (HP)"
                  className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground"
                />
                <input
                  type="number"
                  value={specs.hpMax}
                  onChange={(e) => setSpecs({ ...specs, hpMax: e.target.value })}
                  placeholder="افزایش قدرت تا (HP)"
                  className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground"
                />
                <input
                  type="number"
                  value={specs.tqMin}
                  onChange={(e) => setSpecs({ ...specs, tqMin: e.target.value })}
                  placeholder="افزایش گشتاور از (Nm)"
                  className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground"
                />
                <input
                  type="number"
                  value={specs.tqMax}
                  onChange={(e) => setSpecs({ ...specs, tqMax: e.target.value })}
                  placeholder="افزایش گشتاور تا (Nm)"
                  className="px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground"
                />
                <label className="flex items-center gap-2 text-xs text-foreground">
                  <input type="checkbox" checked={specs.ecu} onChange={(e) => setSpecs({ ...specs, ecu: e.target.checked })} className="accent-primary" />
                  نیاز به ریمپ
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground">
                  <input type="checkbox" checked={specs.proInstall} onChange={(e) => setSpecs({ ...specs, proInstall: e.target.checked })} className="accent-primary" />
                  نصب تخصصی
                </label>
                <textarea
                  value={specs.notes}
                  onChange={(e) => setSpecs({ ...specs, notes: e.target.value })}
                  placeholder="توضیحات فنی"
                  rows={2}
                  className="col-span-2 px-3 py-2.5 bg-surface/60 border border-border rounded-xl text-xs text-foreground resize-none"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm">انصراف</button>
            <button
              type="submit"
              disabled={(createPart.isPending || updatePart.isPending || setPartSpecs.isPending) || !form.name}
              className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm"
            >
              {createPart.isPending || updatePart.isPending || setPartSpecs.isPending ? (
                <Loading text="" size="sm" />
              ) : editingPart ? (
                'به‌روزرسانی'
              ) : (
                'ایجاد'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف قطعه"
        message={`آیا از حذف قطعه «${deleteTarget?.name}» اطمینان دارید؟`}
        confirmLabel="حذف"
        isLoading={deletePart.isPending}
        variant="danger"
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-xl">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <SkeletonText className="w-1/3" />
                <SkeletonText className="w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="listing"
          title="هیچ قطعه‌ای یافت نشد"
          description={debouncedSearch || tab ? 'قطعه‌ای با این مشخصات وجود ندارد' : 'هنوز قطعه‌ای در کاتالوگ ثبت نشده است'}
          action={<button onClick={openCreateModal} className="btn btn-primary">ایجاد اولین قطعه</button>}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border bg-surface-2/50">
                <th className="text-right px-4 py-3">ID</th>
                <th className="text-right px-4 py-3">نام</th>
                <th className="text-right px-4 py-3">نوع قطعه</th>
                <th className="text-right px-4 py-3">دسته کاتالوگ</th>
                <th className="text-right px-4 py-3">شماره فنی</th>
                <th className="text-right px-4 py-3">OEM</th>
                <th className="text-right px-4 py-3">قیمت</th>
                <th className="text-right px-4 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((part: any) => {
                const pt = typeLabelById[String(part.part_type_id)];
                return (
                  <tr key={part.id} className="border-b border-border/50 hover:bg-surface-2/30 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{part.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{part.name}</td>
                    <td className="px-4 py-3">
                      {pt ? (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {pt.label}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate">
                      {part.catalog_category_path ? part.catalog_category_path.split('/').slice(1).join(' / ') : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{part.part_number || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{part.oem_number || '-'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{part.price != null ? `${part.price.toLocaleString()} تومان` : '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(part)}
                          className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          title="ویرایش"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(part)}
                          className="text-destructive hover:text-destructive/80 transition-colors p-1"
                          title="حذف"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
