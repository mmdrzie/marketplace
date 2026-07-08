'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Link from 'next/link';
import { GlassSelect } from '@/components/common/GlassSelect';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Listing } from '@/types';
import Image from 'next/image';
import { queryKeys } from '@/lib/queryKeys';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function DealerListingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.listings.dealer(statusFilter),
    queryFn: async () => {
      const res = await api.get('/dealer/listings', { params: { status: statusFilter || undefined } });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/listings/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.listings.dealer() }); setDeleteTarget(null); },
  });

  const listings = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">آگهی‌های من</h1>
          <p className="text-sm text-muted-foreground mt-1">مدیریت آگهی‌های ثبت شده</p>
        </div>
        <Link href="/dealer/listings/create" className="btn btn-primary">
          <SvgIcon className="h-4 w-4"><path d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></SvgIcon>
          آگهی جدید
        </Link>
      </div>

      <div className="flex gap-3">
        <GlassSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: '', label: 'همه' },
            { value: 'active', label: 'فعال' },
            { value: 'pending', label: 'در انتظار تایید' },
            { value: 'rejected', label: 'رد شده' },
            { value: 'sold', label: 'فروخته شده' },
            { value: 'archived', label: 'آرشیو' },
          ]}
          placeholder="همه"
          className="w-48"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-surface-2 rounded-2xl animate-pulse" />)}</div>
      ) : listings.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center">
            <SvgIcon className="h-8 w-8 text-muted-foreground"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></SvgIcon>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">آگهی ثبت نکرده‌اید</h3>
          <p className="text-sm text-muted-foreground mb-4">اولین آگهی خود را ثبت کنید</p>
          <Link href="/dealer/listings/create" className="btn btn-primary">ثبت آگهی جدید</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(listings as Listing[]).map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {item.primary_image ? (
                  <Image src={item.primary_image} alt={item.title} width={80} height={64} className="w-20 h-16 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-surface-2 shrink-0 flex items-center justify-center">
                    <SvgIcon className="h-6 w-6 text-muted-foreground"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></SvgIcon>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-sm truncate text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{item.city}/{item.province}</p>
                      {item.price != null && item.price > 0 && <p className="text-sm font-medium mt-1 text-foreground">{item.price.toLocaleString('fa-IR')} تومان</p>}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Link href={`/dealer/listings/${item.slug}/edit`} className="text-xs text-primary font-medium hover:text-primary/80 transition-colors">ویرایش</Link>
                    <button onClick={() => setDeleteTarget(item)} className="text-xs text-destructive font-medium hover:text-destructive/80 transition-colors">حذف</button>
                    <span className="text-xs text-muted-foreground mr-auto">{item.created_at ? new Date(item.created_at).toLocaleDateString('fa-IR') : '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-sm border border-border-subtle shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <SvgIcon className="h-7 w-7 text-destructive"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></SvgIcon>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">حذف آگهی</h3>
            <p className="text-sm text-muted-foreground mb-1">آیا از حذف آگهی <span className="font-medium text-foreground">{deleteTarget.title}</span> اطمینان دارید؟</p>
            <p className="text-xs text-destructive mb-5">این عمل قابل بازگشت نیست</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
              <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="flex-1 py-2.5 btn btn-danger">
                {deleteMutation.isPending ? 'در حال حذف...' : 'حذف آگهی'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
