'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { GlassSelect } from '@/components/common/GlassSelect';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import type { ListingDetail } from '@/types';
import Image from 'next/image';
import { queryKeys } from '@/lib/queryKeys';

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const STATUS_OPTIONS = [
  { value: '', label: 'همه' },
  { value: 'published', label: 'منتشر شده' },
  { value: 'pending', label: 'در انتظار تایید' },
  { value: 'rejected', label: 'رد شده' },
  { value: 'sold', label: 'فروخته شده' },
  { value: 'archived', label: 'بایگانی' },
  { value: 'draft', label: 'پیش‌نویس' },
];

export default function AdminAllListingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [detailTarget, setDetailTarget] = useState<ListingDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.listings.allListings(1, statusFilter),
    queryFn: async () => {
      const res = await api.get('/listings', { params: { status: statusFilter || undefined, search: search || undefined } });
      return res.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => { await api.patch(`/listings/${id}`, { action: 'approve' }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => { await api.patch(`/listings/${id}`, { action: 'reject', reason }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-listings'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/listings/${id}`); },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['all-listings'] });
      const previous = queryClient.getQueryData(['all-listings']);
      queryClient.setQueryData(['all-listings'], (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((item: any) => item.id !== id) };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['all-listings'], context.previous);
      }
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: ['admin-listings'] }); queryClient.invalidateQueries({ queryKey: ['all-listings'] }); setDeleteTarget(null); },
  });

  const listings = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">مدیریت همه آگهی‌ها</h1>
        <p className="text-sm text-muted-foreground">{listings.length} آگهی</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <GlassSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={STATUS_OPTIONS}
          placeholder="همه وضعیت‌ها"
          className="w-44"
        />
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl px-3 py-2 pr-9 text-sm"
            placeholder="جستجو در آگهی‌ها..."
          />
          <SvgIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </SvgIcon>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-surface-2 rounded-2xl animate-pulse" />)}</div>
      ) : listings.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-2 border border-border-subtle flex items-center justify-center">
            <SvgIcon className="h-8 w-8 text-muted-foreground"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></SvgIcon>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">آگهی‌ای یافت نشد</h3>
          <p className="text-sm text-muted-foreground">فیلتر یا جستجو را تغییر دهید</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(listings as ListingDetail[]).map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1 min-w-0">
                  {item.primary_image ? (
                    <Image src={item.primary_image} alt={item.title} width={80} height={64} className="w-20 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-16 rounded-xl bg-surface-2 shrink-0 flex items-center justify-center">
                      <SvgIcon className="h-6 w-6 text-muted-foreground"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></SvgIcon>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm text-foreground truncate">{item.title}</h3>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.seller_name || 'کاربر'} {item.city_name ? `- ${item.city_name}` : ''}</p>
                    <PriceDisplay price={item.price} priceType={item.price_type} />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {item.category_name && `${item.category_name} | `}
                      {item.created_at && new Date(item.created_at).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setDetailTarget(item)} className="p-2 btn btn-ghost btn-sm" title="جزئیات">
                    <SvgIcon className="h-4 w-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></SvgIcon>
                  </button>
                  {item.status === 'pending' && (
                    <>
                      <button onClick={() => approveMutation.mutate(item.id)} disabled={approveMutation.isPending} className="px-3 py-1.5 btn btn-success btn-sm text-xs">
                        تایید
                      </button>
                      <button onClick={() => setDeleteTarget({ id: item.id, title: item.title })} className="px-3 py-1.5 btn btn-danger btn-sm text-xs">
                        رد
                      </button>
                    </>
                  )}
                  {item.status !== 'pending' && (
                    <button onClick={() => setDeleteTarget({ id: item.id, title: item.title })} className="p-2 btn btn-ghost btn-sm text-destructive" title="حذف">
                      <SvgIcon className="h-4 w-4"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></SvgIcon>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailTarget && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailTarget(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg border border-border-subtle shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{detailTarget.title}</h3>
              <button onClick={() => setDetailTarget(null)} className="btn btn-ghost btn-sm">
                <SvgIcon><path d="M6 6l12 12M18 6l-12 12" /></SvgIcon>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {detailTarget.primary_image && (
                <Image src={detailTarget.primary_image} alt="" width={400} height={240} className="w-full h-48 rounded-xl object-cover" />
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">وضعیت: </span><StatusBadge status={detailTarget.status} /></div>
                <div><span className="text-muted-foreground">قیمت: </span><PriceDisplay price={detailTarget.price} priceType={detailTarget.price_type} /></div>
                {detailTarget.seller_name && <div><span className="text-muted-foreground">کاربر: </span>{detailTarget.seller_name}</div>}
                {detailTarget.city_name && <div><span className="text-muted-foreground">شهر: </span>{detailTarget.city_name}</div>}
                {detailTarget.province_name && <div><span className="text-muted-foreground">استان: </span>{detailTarget.province_name}</div>}
                {detailTarget.category_name && <div><span className="text-muted-foreground">دسته‌بندی: </span>{detailTarget.category_name}</div>}
                {detailTarget.created_at && <div><span className="text-muted-foreground">تاریخ ثبت: </span>{new Date(detailTarget.created_at).toLocaleDateString('fa-IR')}</div>}
              </div>
              {detailTarget.description && (
                <div>
                  <p className="text-muted-foreground mb-1">توضیحات:</p>
                  <p className="text-foreground text-sm whitespace-pre-line">{detailTarget.description}</p>
                </div>
              )}
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
            <h3 className="text-lg font-bold text-foreground mb-2">حذف آگهی</h3>
            <p className="text-sm text-muted-foreground mb-1">آیا از حذف <span className="font-medium text-foreground">{deleteTarget.title}</span> اطمینان دارید؟</p>
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
