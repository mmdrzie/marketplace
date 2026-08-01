'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useAdminWorkshops,
  useAdminApproveWorkshop,
  useAdminRejectWorkshop,
  useAdminSuspendWorkshop,
  useAdminUpdateWorkshop,
  useAdminDeleteWorkshop,
} from '@/hooks/useWorkshops';
import { workshopTypeMeta, WorkshopTypeIcon } from '@/components/workshops/workshopMeta';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton, SkeletonText } from '@/components/common/Skeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Modal } from '@/components/common/Modal';
import { toast } from '@/components/common/Toast';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  suspended: 'bg-surface-2 text-muted-foreground border-border',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  approved: 'تأیید شده',
  rejected: 'رد شده',
  suspended: 'مسدود',
};

const FILTER_TABS = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'approved', label: 'تأیید شده' },
  { value: 'rejected', label: 'رد شده' },
  { value: 'suspended', label: 'مسدود' },
  { value: '', label: 'همه' },
];

function maskEmail(email: string): string {
  if (!email) return '';
  const atIndex = email.indexOf('@');
  if (atIndex <= 3) return email;
  return email.slice(0, 3) + '***' + email.slice(atIndex);
}

export default function AdminWorkshopsPage() {
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [approveTarget, setApproveTarget] = useState<string | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    workshop_name: '',
    type: 'mechanic',
    specialty: '',
    city: '',
    address: '',
    phone: '',
    hours: '',
    services: '',
    status: 'pending',
  });

  const { data: workshops, isLoading, isError, error } = useAdminWorkshops(filter);
  const approveWorkshop = useAdminApproveWorkshop();
  const rejectWorkshop = useAdminRejectWorkshop();
  const suspendWorkshop = useAdminSuspendWorkshop();
  const updateWorkshop = useAdminUpdateWorkshop();
  const deleteWorkshop = useAdminDeleteWorkshop();

  const list = workshops ?? [];

  const openEdit = (w: any) => {
    setEditTarget(w);
    setEditForm({
      workshop_name: w.workshop_name || '',
      type: w.type || 'mechanic',
      specialty: w.specialty || '',
      city: w.city || '',
      address: w.address || '',
      phone: w.phone || '',
      hours: w.hours || '',
      services: (w.services || []).join('، '),
      status: w.status || 'pending',
    });
  };

  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      await updateWorkshop.mutateAsync({
        userId: editTarget.user_id,
        workshop_name: editForm.workshop_name,
        type: editForm.type,
        specialty: editForm.specialty,
        city: editForm.city,
        address: editForm.address,
        phone: editForm.phone,
        hours: editForm.hours,
        services: editForm.services.split(/[،,]/).map((s: string) => s.trim()).filter(Boolean),
        status: editForm.status,
      });
      toast({ type: 'success', title: 'تعمیرگاه ویرایش شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در ویرایش تعمیرگاه' });
    } finally {
      setEditTarget(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWorkshop.mutateAsync(deleteTarget);
      toast({ type: 'success', title: 'تعمیرگاه حذف شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در حذف تعمیرگاه' });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      await approveWorkshop.mutateAsync(approveTarget);
      toast({ type: 'success', title: 'تعمیرگاه تأیید شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در تأیید تعمیرگاه' });
    } finally {
      setApproveTarget(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectWorkshop.mutateAsync({ userId: rejectModal, note: rejectNote });
      toast({ type: 'success', title: 'درخواست رد شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در رد درخواست' });
    } finally {
      setRejectModal(null);
      setRejectNote('');
    }
  };

  const handleSuspend = async () => {
    if (!suspendTarget) return;
    try {
      await suspendWorkshop.mutateAsync(suspendTarget);
      toast({ type: 'success', title: 'تعمیرگاه مسدود شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در مسدودسازی' });
    } finally {
      setSuspendTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مدیریت تعمیرکاران و تیونرها</h1>
        <p className="text-sm text-muted-foreground mt-1">بررسی و تأیید درخواست‌های ثبت تعمیرگاه</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              filter === tab.value
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-surface-2 text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isError ? (
        <div className="glass rounded-2xl p-12 text-center border border-destructive/20">
          <p className="text-destructive font-bold mb-2">خطا در بارگذاری تعمیرگاه‌ها</p>
          <p className="text-sm text-muted-foreground">{(error as any)?.message || 'لطفاً مجدداً تلاش کنید'}</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-border-subtle">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <SkeletonText className="w-40 h-5" />
                    <SkeletonText className="w-60 h-4" />
                    <SkeletonText className="w-24 h-4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <SkeletonText className="w-20 h-5" />
                  <SkeletonText className="w-32 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="listing"
          title="هیچ تعمیرگاهی یافت نشد"
          description={
            filter
              ? `هیچ تعمیرگاهی با وضعیت "${STATUS_LABELS[filter] || filter}" وجود ندارد`
              : 'هنوز هیچ تعمیرگاهی ثبت‌نام نکرده است'
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((w: any) => {
            const meta = workshopTypeMeta(w.type);
            return (
            <div key={w.user_id} className="glass rounded-2xl p-5 border border-border-subtle">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg font-bold text-primary">
                    {w.workshop_name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-foreground text-sm">{w.workshop_name}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${meta.bg} ${meta.border} ${meta.text}`}>
                        <WorkshopTypeIcon type={w.type} className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {w.owner_name} - {maskEmail(w.owner_email)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{w.workshop_slug}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                      {w.city && <span>{w.city}</span>}
                      {w.specialty && <span>{w.specialty}</span>}
                      <span>{w.documents?.length || 0} مدرک</span>
                      {w.created_at && <span>{new Date(w.created_at).toLocaleDateString('fa-IR')}</span>}
                    </div>
                    {w.address && <p className="text-xs text-muted-foreground mt-1 truncate">{w.address}</p>}
                    {w.documents?.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {w.documents.map((doc: string, i: number) => (
                          <a
                            key={i}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-primary hover:underline"
                          >
                            مشاهده مدرک {i + 1}
                          </a>
                        ))}
                      </div>
                    )}
                    {w.status === 'approved' && (
                      <Link href={`/workshops/${w.workshop_slug}`} className="text-[10px] text-primary hover:underline inline-block mt-1">
                        مشاهده پروفایل عمومی
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-[10px] px-3 py-1 rounded-full border font-medium ${STATUS_STYLES[w.status] || ''}`}>
                    {STATUS_LABELS[w.status] || w.status}
                  </span>

                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApproveTarget(w.user_id)}
                        disabled={approveWorkshop.isPending}
                        className="px-3 py-1.5 text-[10px] rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all disabled:opacity-50"
                      >
                        تأیید
                      </button>
                      <button
                        onClick={() => {
                          setRejectModal(w.user_id);
                          setRejectNote('');
                        }}
                        disabled={rejectWorkshop.isPending}
                        className="px-3 py-1.5 text-[10px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all disabled:opacity-50"
                      >
                        رد
                      </button>
                    </div>
                  )}

                  {w.status === 'approved' && (
                    <button
                      onClick={() => setSuspendTarget(w.user_id)}
                      disabled={suspendWorkshop.isPending}
                      className="px-3 py-1.5 text-[10px] rounded-lg bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-all disabled:opacity-50"
                    >
                      مسدود
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(w)}
                      className="px-3 py-1.5 text-[10px] rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => setDeleteTarget(w.user_id)}
                      disabled={deleteWorkshop.isPending}
                      className="px-3 py-1.5 text-[10px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all disabled:opacity-50"
                    >
                      حذف
                    </button>
                  </div>

                  {w.admin_note && (
                    <p className="text-[10px] text-muted-foreground text-right">یادداشت: {w.admin_note}</p>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        title="تأیید تعمیرگاه"
        message="آیا از تأیید این تعمیرگاه اطمینان دارید؟"
        confirmLabel="تأیید تعمیرگاه"
        isLoading={approveWorkshop.isPending}
        variant="primary"
      />

      <ConfirmDialog
        open={!!suspendTarget}
        onClose={() => setSuspendTarget(null)}
        onConfirm={handleSuspend}
        title="مسدودسازی تعمیرگاه"
        message="با مسدودسازی، پروفایل از فهرست عمومی حذف می‌شود."
        confirmLabel="مسدود"
        isLoading={suspendWorkshop.isPending}
        variant="danger"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="حذف تعمیرگاه"
        message="پروفایل تعمیرگاه به‌صورت کامل حذف می‌شود. این عمل قابل بازگشت نیست."
        confirmLabel="حذف"
        isLoading={deleteWorkshop.isPending}
        variant="danger"
      />

      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`ویرایش تعمیرگاه — ${editTarget?.workshop_name || ''}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">نام تعمیرگاه</label>
            <input
              value={editForm.workshop_name}
              onChange={(e) => setEditForm({ ...editForm, workshop_name: e.target.value })}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">نوع فعالیت</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="mechanic">تعمیرکار</option>
                <option value="tuner">تیونر</option>
                <option value="both">تعمیرکار و تیونر</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">وضعیت</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="pending">در انتظار</option>
                <option value="approved">تأیید شده</option>
                <option value="rejected">رد شده</option>
                <option value="suspended">مسدود</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">تخصص</label>
            <input
              value={editForm.specialty}
              onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">شهر</label>
              <input
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">تلفن</label>
              <input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
                dir="ltr"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">آدرس</label>
            <input
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">ساعت کاری</label>
            <input
              value={editForm.hours}
              onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground mb-1.5">خدمات (با کاما جدا کنید)</label>
            <input
              value={editForm.services}
              onChange={(e) => setEditForm({ ...editForm, services: e.target.value })}
              className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setEditTarget(null)}
              disabled={updateWorkshop.isPending}
              className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm"
            >
              انصراف
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={updateWorkshop.isPending || !editForm.workshop_name.trim()}
              className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm disabled:opacity-50"
            >
              {updateWorkshop.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="رد درخواست تعمیرگاه"
      >
        <p className="text-sm text-muted-foreground mb-4">دلیل رد را وارد کنید</p>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none mb-4"
          placeholder="دلیل رد..."
        />
        <div className="flex gap-3">
          <button
            onClick={() => setRejectModal(null)}
            disabled={rejectWorkshop.isPending}
            className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm"
          >
            انصراف
          </button>
          <button
            onClick={handleReject}
            disabled={rejectWorkshop.isPending || !rejectNote.trim()}
            className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm bg-destructive hover:bg-destructive/90 disabled:opacity-50"
          >
            {rejectWorkshop.isPending ? 'در حال انجام...' : 'تأیید رد'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
