'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/common/Toast';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton, SkeletonText } from '@/components/common/Skeleton';
import {
  useAdminSuggestions,
  useAdminApproveSuggestion,
  useAdminRejectSuggestion,
} from '@/hooks/usePartsV2';

const TABS = [
  { key: 'pending', label: 'در انتظار' },
  { key: 'approved', label: 'تأیید شده' },
  { key: 'rejected', label: 'رد شده' },
  { key: '', label: 'همه' },
] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  approved: 'تأیید شده',
  rejected: 'رد شده',
};

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminSuggestionsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('pending');
  const [approveTarget, setApproveTarget] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const { data: suggestions, isLoading, isError, error } = useAdminSuggestions(filter);
  const approveMutation = useAdminApproveSuggestion();
  const rejectMutation = useAdminRejectSuggestion();

  const list: any[] = suggestions ?? [];

  const handleApprove = () => {
    if (approveTarget === null) return;
    approveMutation.mutate(approveTarget, {
      onSuccess: () => {
        toast({ type: 'success', title: 'پیشنهاد تأیید شد', message: 'قطعه به کاتالوگ اضافه شد' });
        setApproveTarget(null);
        queryClient.invalidateQueries({ queryKey: ['admin', 'suggestions'] });
      },
      onError: (err: any) => {
        toast({ type: 'error', title: 'خطا در تأیید', message: err?.response?.data?.message || err.message });
      },
    });
  };

  const handleReject = () => {
    if (rejectTarget === null) return;
    rejectMutation.mutate({ id: rejectTarget, note: rejectNote }, {
      onSuccess: () => {
        toast({ type: 'success', title: 'پیشنهاد رد شد' });
        setRejectTarget(null);
        setRejectNote('');
        queryClient.invalidateQueries({ queryKey: ['admin', 'suggestions'] });
      },
      onError: (err: any) => {
        toast({ type: 'error', title: 'خطا در رد پیشنهاد', message: err?.response?.data?.message || err.message });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">پیشنهادات فروشندگان</h1>
        <p className="text-sm text-muted-foreground mt-1">بررسی و تأیید قطعات پیشنهادی فروشندگان برای افزودن به کاتالوگ</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-xs font-medium rounded-xl transition-all ${
              filter === tab.key
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-surface-2 text-muted-foreground border border-border hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border-subtle p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <SkeletonText className="w-64" />
              <div className="flex gap-4">
                <SkeletonText className="w-24" />
                <SkeletonText className="w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-bold">خطا در بارگذاری پیشنهادات</p>
          <p className="text-sm text-muted-foreground mt-1">{(error as any)?.response?.data?.message || (error as any)?.message || 'مشکلی پیش آمده است'}</p>
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          title="هیچ پیشنهادی یافت نشد"
          description={filter ? `هیچ پیشنهادی با وضعیت «${STATUS_LABELS[filter] || filter}» وجود ندارد` : 'هنوز پیشنهادی ثبت نشده است'}
          icon="message"
        />
      ) : (
        <div className="space-y-3">
          {list.map((s: any) => (
            <div key={s.id} className="rounded-2xl border border-border-subtle bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-foreground text-sm">{s.name}</h3>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLES[s.status] || ''}`}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">فروشنده: {s.store_id}</p>
                  {s.created_at && <p className="text-[10px] text-muted-foreground mb-2">{formatDate(s.created_at)}</p>}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {s.part_number && <span>کد قطعه: {s.part_number}</span>}
                    {s.oem_number && <span>OEM: {s.oem_number}</span>}
                    {s.manufacturer && <span>تولیدکننده: {s.manufacturer}</span>}
                  </div>
                  {s.description && <p className="text-xs text-muted-foreground mt-2">{s.description}</p>}
                  {s.admin_note && (
                    <p className="text-xs text-muted-foreground mt-2 bg-surface-2 rounded-lg px-3 py-1.5 inline-block">
                      یادداشت مدیر: {s.admin_note}
                    </p>
                  )}
                </div>

                {s.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setApproveTarget(s.id)}
                      className="px-3 py-1.5 text-[10px] rounded-lg bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-all"
                    >
                      تأیید و افزودن
                    </button>
                    <button
                      onClick={() => { setRejectTarget(s.id); setRejectNote(''); }}
                      className="px-3 py-1.5 text-[10px] rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all"
                    >
                      رد
                    </button>
                  </div>
                )}
              </div>

              {rejectTarget === s.id && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-xs font-medium text-foreground mb-2">دلیل رد:</p>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-surface/60 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none mb-3"
                    placeholder="دلیل رد را وارد کنید..."
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => { setRejectTarget(null); setRejectNote(''); }}
                      className="px-4 py-1.5 text-xs rounded-lg bg-surface-2 text-muted-foreground border border-border hover:text-foreground transition-all"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={rejectMutation.isPending}
                      className="px-4 py-1.5 text-xs rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-all disabled:opacity-50"
                    >
                      {rejectMutation.isPending ? 'در حال رد...' : 'تأیید رد'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={approveTarget !== null}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        title="تأیید پیشنهاد"
        message="آیا از تأیید این پیشنهاد و افزودن قطعه به کاتالوگ اطمینان دارید؟"
        confirmLabel="تأیید و افزودن"
        isLoading={approveMutation.isPending}
        variant="primary"
      />
    </div>
  );
}
