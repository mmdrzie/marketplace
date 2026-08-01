'use client';

import { useState } from 'react';
import { useAdminStores, useAdminApproveStore, useAdminRejectStore } from '@/hooks/usePartsV2';
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
  { value: '', label: 'همه' },
];

function maskEmail(email: string): string {
  if (!email) return '';
  const atIndex = email.indexOf('@');
  if (atIndex <= 3) return email;
  return email.slice(0, 3) + '***' + email.slice(atIndex);
}

export default function AdminStoresPage() {
  const [filter, setFilter] = useState('pending');
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [approveTarget, setApproveTarget] = useState<string | null>(null);

  const { data: stores, isLoading, isError, error } = useAdminStores(filter);
  const approveStore = useAdminApproveStore();
  const rejectStore = useAdminRejectStore();

  const list = stores ?? [];

  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      await approveStore.mutateAsync(approveTarget);
      toast({ type: 'success', title: 'فروشگاه با موفقیت تأیید شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در تأیید فروشگاه' });
    } finally {
      setApproveTarget(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectStore.mutateAsync({ userId: rejectModal, note: rejectNote });
      toast({ type: 'success', title: 'فروشگاه رد شد' });
    } catch {
      toast({ type: 'error', title: 'خطا در رد فروشگاه' });
    } finally {
      setRejectModal(null);
      setRejectNote('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">مدیریت فروشگاه‌ها</h1>
        <p className="text-sm text-muted-foreground mt-1">بررسی و تأیید درخواست‌های فروشندگان قطعات</p>
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
          <p className="text-destructive font-bold mb-2">خطا در بارگذاری فروشگاه‌ها</p>
          <p className="text-sm text-muted-foreground">
            {(error as any)?.message || 'لطفاً مجدداً تلاش کنید'}
          </p>
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
          title="هیچ فروشگاه‌ای یافت نشد"
          description={
            filter
              ? `هیچ فروشگاهی با وضعیت "${STATUS_LABELS[filter] || filter}" وجود ندارد`
              : 'هنوز هیچ فروشگاه‌ای ثبت‌نام نکرده است'
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((store: any) => (
            <div key={store.user_id} className="glass rounded-2xl p-5 border border-border-subtle">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-lg font-bold text-primary">
                    {store.store_name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-foreground text-sm">{store.store_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {store.owner_name} - {maskEmail(store.owner_email)}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{store.store_slug}</p>
                    {store.phone && <p className="text-xs text-muted-foreground">{store.phone}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{store.documents?.length || 0} مدرک</span>
                      {store.created_at && (
                        <span>{new Date(store.created_at).toLocaleDateString('fa-IR')}</span>
                      )}
                      <span>{store.part_count || 0} قطعه</span>
                    </div>
                    {store.documents?.length > 0 && (
                      <div className="flex gap-2 mt-1">
                        {store.documents.map((doc: string, i: number) => (
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
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full border font-medium ${STATUS_STYLES[store.status] || ''}`}
                  >
                    {STATUS_LABELS[store.status] || store.status}
                  </span>

                  {store.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setApproveTarget(store.user_id)}
                        disabled={approveStore.isPending}
                        className="px-3 py-1.5 text-[10px] rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all disabled:opacity-50"
                      >
                        تأیید
                      </button>
                      <button
                        onClick={() => {
                          setRejectModal(store.user_id);
                          setRejectNote('');
                        }}
                        disabled={rejectStore.isPending}
                        className="px-3 py-1.5 text-[10px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all disabled:opacity-50"
                      >
                        رد
                      </button>
                    </div>
                  )}

                  {store.admin_note && (
                    <p className="text-[10px] text-muted-foreground text-right">
                      یادداشت: {store.admin_note}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        title="تأیید فروشگاه"
        message="آیا از تأیید این فروشگاه اطمینان دارید؟"
        confirmLabel="تأیید فروشگاه"
        isLoading={approveStore.isPending}
        variant="primary"
      />

      <Modal
        open={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="رد درخواست فروشگاه"
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
            disabled={rejectStore.isPending}
            className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm"
          >
            انصراف
          </button>
          <button
            onClick={handleReject}
            disabled={rejectStore.isPending || !rejectNote.trim()}
            className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm bg-destructive hover:bg-destructive/90 disabled:opacity-50"
          >
            {rejectStore.isPending ? 'در حال انجام...' : 'تأیید رد'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
