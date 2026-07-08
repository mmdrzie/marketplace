'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEscrowStore } from '@/store/escrowStore';
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS, DEAL_STATUS_BG } from '@/store/escrowStore';
import { EscrowTimeline } from '@/components/escrow/EscrowTimeline';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';
import { toast } from '@/components/common/Toast';

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const deal = useEscrowStore((s) => s.getDeal(Number(id)));
  const updateStatus = useEscrowStore((s) => s.updateStatus);

  if (!deal) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="glass rounded-3xl p-12 text-center border border-border-subtle">
          <p className="text-muted-foreground">معامله یافت نشد</p>
        </div>
      </div>
    );
  }

  const isBuyer = deal.buyerId === user?.id;
  const isSeller = deal.sellerId === user?.id;

  const actions: { label: string; action: () => void; variant: string; condition: boolean }[] = [
    {
      label: 'تأیید پرداخت',
      action: () => {
        updateStatus(deal.id, 'payment_held');
        toast({ type: 'success', title: 'وجه با موفقیت بلوکه شد' });
      },
      variant: 'btn btn-primary',
      condition: isBuyer && deal.status === 'pending_payment',
    },
    {
      label: 'تأیید تحویل',
      action: () => {
        updateStatus(deal.id, 'under_review');
        toast({ type: 'success', title: 'تحویل تأیید شد. در انتظار بررسی اسناد' });
      },
      variant: 'btn btn-primary',
      condition: isBuyer && deal.status === 'payment_held',
    },
    {
      label: 'آزادسازی وجه',
      action: () => {
        updateStatus(deal.id, 'released');
        toast({ type: 'success', title: 'وجه به فروشنده آزاد شد' });
      },
      variant: 'btn btn-success',
      condition: isSeller && deal.status === 'under_review',
    },
    {
      label: 'لغو معامله',
      action: () => {
        updateStatus(deal.id, 'cancelled');
        toast({ type: 'info', title: 'معامله لغو شد' });
      },
      variant: 'btn btn-danger',
      condition: deal.status === 'pending_payment' || deal.status === 'payment_held',
    },
  ];

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        {/* پس‌زمینه داینامیک معماری */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto w-full px-4 py-12 md:py-16 space-y-8">
          <Breadcrumbs />

          <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2 group">
            <svg className="h-4 w-4 -scale-x-100 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            بازگشت به معاملات
          </button>

          {/* کارت اطلاعات معامله */}
          <div className={`glass rounded-3xl p-6 md:p-8 border ${DEAL_STATUS_BG[deal.status]} shadow-sm`}>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground">{deal.listingTitle}</h1>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${DEAL_STATUS_COLORS[deal.status]} whitespace-nowrap shrink-0`}>
                {DEAL_STATUS_LABELS[deal.status]}
              </span>
            </div>
            <div className="text-sm text-muted-foreground font-light">
              {isBuyer ? `فروشنده: ${deal.sellerName}` : `خریدار: ${deal.buyerName}`}
            </div>
            <div className="flex items-baseline gap-2 mt-4 pt-4 border-t border-border-subtle">
              <span className="text-3xl font-bold text-foreground tracking-tighter">{deal.amount.toLocaleString('fa-IR')}</span>
              <span className="text-sm text-muted-foreground">تومان</span>
            </div>
          </div>

          {/* کارت مراحل معامله */}
          <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-8 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              مراحل معامله
            </h3>
            <EscrowTimeline status={deal.status} />
          </div>

          {/* دکمه‌های اکشن */}
          {actions.some((a) => a.condition) && (
            <div className="flex flex-wrap gap-4 pt-4">
              {actions.filter((a) => a.condition).map((a) => (
                <button key={a.label} onClick={a.action} className={`btn ${a.variant} rounded-xl`}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}