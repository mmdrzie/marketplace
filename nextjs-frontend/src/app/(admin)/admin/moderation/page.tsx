'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import type { ListingDetail } from '@/types';
import Image from 'next/image';
import { queryKeys } from '@/lib/queryKeys';

export default function ModerationPage() {
  const queryClient = useQueryClient();
  const [rejectTarget, setRejectTarget] = useState<{ id: number; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [detailTarget, setDetailTarget] = useState<ListingDetail | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.pending,
    queryFn: async () => { const res = await api.get('/admin/listings/pending'); return res.data; },
    refetchInterval: 15000,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => { await api.post(`/admin/listings/${id}/approve`); },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.pending });
      const previous = queryClient.getQueryData(queryKeys.admin.pending);
      queryClient.setQueryData(queryKeys.admin.pending, (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((item: any) => item.id !== id) };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.admin.pending, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.pending }),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => { await api.post(`/admin/listings/${id}/reject`, { reason }); },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.admin.pending });
      const previous = queryClient.getQueryData(queryKeys.admin.pending);
      queryClient.setQueryData(queryKeys.admin.pending, (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.filter((item: any) => item.id !== id) };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.admin.pending, context.previous);
      }
    },
    onSettled: () => { queryClient.invalidateQueries({ queryKey: queryKeys.admin.pending }); setRejectTarget(null); setRejectReason(''); },
  });

  const listings = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">مدیریت آگهی‌ها</h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-surface-2 rounded-2xl animate-pulse" />)}</div>
      ) : listings.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">همه آگهی‌ها بررسی شده‌اند</h3>
          <p className="text-sm text-muted-foreground">در حال حاضر آگهی در انتظار تایید وجود ندارد</p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{listings.length} آگهی در انتظار بررسی</p>
          {(listings as ListingDetail[]).map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 flex-1 min-w-0">
                  {item.primary_image ? (
                    <Image src={item.primary_image} alt={item.title} width={80} height={64} className="w-20 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-16 rounded-xl bg-surface-2 shrink-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm text-foreground truncate">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.seller_name || 'کارگر'} {item.city_name ? `- ${item.city_name}` : ''}</p>
                    <PriceDisplay price={item.price} priceType={item.price_type} />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {item.category_name && `${item.category_name} | `}
                      {new Date(item.created_at || '').toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setDetailTarget(item)} className="p-2 btn btn-ghost btn-sm" title="مشاهده جزئیات">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  </button>
                  <button onClick={() => approveMutation.mutate(item.id)} disabled={approveMutation.isPending} className="px-4 py-2 btn btn-success btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    تایید
                  </button>
                  <button onClick={() => { setRejectTarget({ id: item.id, title: item.title }); setRejectReason(''); }} className="px-4 py-2 btn btn-danger btn-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    رد
                  </button>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6l-12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {detailTarget.primary_image && (
                <Image src={detailTarget.primary_image} alt="" width={400} height={240} className="w-full h-48 rounded-xl object-cover" />
              )}
              <div className="grid grid-cols-2 gap-3">
                {detailTarget.seller_name && <div><span className="text-muted-foreground">کاربر: </span>{detailTarget.seller_name}</div>}
                {detailTarget.city_name && <div><span className="text-muted-foreground">شهر: </span>{detailTarget.city_name}</div>}
                {detailTarget.province_name && <div><span className="text-muted-foreground">استان: </span>{detailTarget.province_name}</div>}
                {detailTarget.category_name && <div><span className="text-muted-foreground">دسته‌بندی: </span>{detailTarget.category_name}</div>}
                {detailTarget.created_at && <div><span className="text-muted-foreground">تاریخ ثبت: </span>{new Date(detailTarget.created_at).toLocaleDateString('fa-IR')}</div>}
              </div>
              <PriceDisplay price={detailTarget.price} priceType={detailTarget.price_type} />
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

      {/* Rejection Reason Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setRejectTarget(null)}>
          <div className="glass rounded-2xl p-6 w-full max-w-md border border-border-subtle shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
            </div>
            <h3 className="text-lg font-bold text-foreground text-center mb-1">رد آگهی</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">آگهی: {rejectTarget.title}</p>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">دلیل رد</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-border-subtle rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none"
                placeholder="دلیل رد آگهی را وارد کنید (برای اطلاع کاربر ارسال می‌شود)..."
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-left">{rejectReason.length}/500</p>
            </div>
            {rejectMutation.isError && (
              <p className="text-destructive text-sm mt-3">{(rejectMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'خطا در رد آگهی'}</p>
            )}
            <div className="flex gap-3 mt-5">
              <button onClick={() => setRejectTarget(null)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
              <button onClick={() => rejectMutation.mutate({ id: rejectTarget.id, reason: rejectReason || 'عدم تطابق با قوانین' })} disabled={rejectMutation.isPending} className="flex-1 py-2.5 btn btn-danger">
                {rejectMutation.isPending ? 'در حال رد...' : 'رد آگهی'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
