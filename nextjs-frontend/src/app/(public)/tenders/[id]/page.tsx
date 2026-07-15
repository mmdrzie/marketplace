'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTender, usePlaceBid } from '@/hooks/useTenders';
import type { TenderType, TenderStatus, BidStatus } from '@/store/tenderStore';
import { TENDER_TYPE_LABELS, TENDER_STATUS_LABELS, TENDER_STATUS_COLORS, TENDER_STATUS_BG } from '@/store/tenderStore';
import { useAuthStore } from '@/store/authStore';
import { BidCard } from '@/components/tender/BidCard';
import { BidForm } from '@/components/tender/BidForm';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';
import { toast } from '@/components/common/Toast';

export default function TenderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: tender } = useTender(id);
  const placeBid = usePlaceBid(Number(id));
  const [showBidForm, setShowBidForm] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsExpired(new Date(tender?.deadline || '') < new Date()), 0);
    return () => clearTimeout(t);
  }, [tender?.deadline]);

  if (!tender) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center text-muted-foreground">
        درخواست یافت نشد
      </div>
    );
  }

  const isOwner = tender.userId === user?.id;
  const isDealer = user?.role === 'dealer' || user?.role === 'agency';

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-primary/8 rounded-full blur-[100px] -z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[250px] h-[250px] bg-primary/8 rounded-full blur-[80px] -z-0 pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
          <Breadcrumbs />

          <div className="flex items-center gap-3 mb-6">
            <Link href="/tenders" className="btn btn-ghost btn-sm">
              <svg className="h-4 w-4 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              بازگشت به درخواست‌ها
            </Link>
          </div>

          <div className={`glass rounded-2xl p-6 border mb-6 ${TENDER_STATUS_BG[tender.status as TenderStatus]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TENDER_STATUS_BG[tender.status as TenderStatus]} ${TENDER_STATUS_COLORS[tender.status as TenderStatus]}`}>
                    {TENDER_STATUS_LABELS[tender.status as TenderStatus]}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {TENDER_TYPE_LABELS[tender.type as TenderType]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{tender.userName}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-foreground">{tender.title}</h1>
                {tender.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{tender.description}</p>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-xs text-muted-foreground">
                  <span>نوع ماشین‌آلات: <strong className="text-foreground">{tender.machineType}</strong></span>
                  {tender.quantity > 1 && <span>تعداد: <strong className="text-foreground">{tender.quantity}</strong></span>}
                  <span>موقعیت: <strong className="text-foreground">{tender.provinceName}</strong></span>
                  {tender.duration !== '—' && <span>مدت: <strong className="text-foreground">{tender.duration}</strong></span>}
                  <span>مهلت: <strong className="text-foreground">{new Date(tender.deadline).toLocaleDateString('fa-IR')}</strong></span>
                </div>
                <div className="mt-4 text-lg font-black text-foreground">
                  {tender.budgetMin.toLocaleString('fa-IR')} - {tender.budgetMax.toLocaleString('fa-IR')}
                  <span className="text-xs text-muted-foreground font-normal mr-1">تومان</span>
                </div>
              </div>
            </div>

            {isOwner && tender.status === 'open' && (
              <button
                onClick={() => { toast({ type: 'info', title: 'درخواست بسته شد' }); }}
                className="mt-4 btn btn-ghost text-xs text-destructive border-destructive/20"
              >
                بستن درخواست
              </button>
            )}
          </div>

          <div className="glass rounded-2xl p-5 border border-border-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-foreground">
                پیشنهادات دریافتی
                <span className="mr-2 text-[10px] text-muted-foreground font-normal">({tender.bids.length} پیشنهاد)</span>
              </h3>
              {!isOwner && isDealer && tender.status === 'open' && !isExpired && (
                <button onClick={() => setShowBidForm(!showBidForm)} className="btn btn-sm btn-primary text-xs">
                  {showBidForm ? 'انصراف' : 'ثبت پیشنهاد'}
                </button>
              )}
            </div>

            {showBidForm && (
              <div className="mb-6 p-4 bg-surface-2 rounded-2xl border border-border-subtle">
                <BidForm
                  onSubmit={(data) => {
                    if (!user) { router.push('/login'); return; }
                    placeBid.mutateAsync(data);
                    setShowBidForm(false);
                    toast({ type: 'success', title: 'پیشنهاد شما ثبت شد' });
                  }}
                  onCancel={() => setShowBidForm(false)}
                />
              </div>
            )}

            {tender.bids.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">هنوز پیشنهادی ثبت نشده است</p>
            ) : (
              <div className="space-y-3">
                {tender.bids.map((bid: { id: number; status: BidStatus; dealerName: string; dealerBusiness: string; amount: number; description: string; createdAt: string; tenderId: number; dealerId: string | number }) => (
                  <BidCard
                    key={bid.id}
                    bid={bid}
                    isOwner={isOwner}
                    onAccept={() => {
                      toast({ type: 'success', title: 'پیشنهاد تأیید شد' });
                    }}
                    onReject={() => {
                      toast({ type: 'info', title: 'پیشنهاد رد شد' });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
