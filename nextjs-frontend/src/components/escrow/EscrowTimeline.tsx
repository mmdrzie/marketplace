'use client';

import type { DealStatus } from '@/store/escrowStore';

interface EscrowTimelineProps {
  status: DealStatus;
  className?: string;
}

const STEPS: { key: DealStatus; label: string; icon: React.ReactNode }[] = [
  {
    key: 'pending_payment',
    label: 'در انتظار پرداخت',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" /></svg>,
  },
  {
    key: 'payment_held',
    label: 'وجه بلوکه شده',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
  },
  {
    key: 'under_review',
    label: 'بررسی اسناد',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  },
  {
    key: 'released',
    label: 'آزادسازی وجه',
    icon: <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  },
];

const ACTIVE_BG: Record<DealStatus, string> = {
  pending_payment: 'bg-warning',
  payment_held: 'bg-accent-blue',
  under_review: 'bg-accent-indigo',
  released: 'bg-success',
  cancelled: 'bg-destructive',
};

export function EscrowTimeline({ status, className = '' }: EscrowTimelineProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === status);
  const isCancelled = status === 'cancelled';

  return (
    <div className={`flex items-start gap-0 ${className}`}>
      {STEPS.map((step, idx) => {
        const isActive = idx <= currentIdx && !isCancelled;
        const isCurrent = idx === currentIdx;
        const isPast = idx < currentIdx;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.key} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCancelled && isCurrent
                    ? 'border-destructive bg-destructive/10 text-destructive'
                    : isActive && isCurrent
                    ? `border-current ${ACTIVE_BG[status]} text-white shadow-lg`
                    : isActive
                    ? `border-current ${ACTIVE_BG[step.key]} text-white`
                    : 'border-border-subtle bg-surface-2 text-muted-foreground'
                } ${isCurrent && !isCancelled ? 'scale-110' : ''}`}
              >
                <span className={`${isActive && !isCurrent ? 'text-white' : ''}`}>
                  {step.icon}
                </span>
              </div>
              <span
                className={`text-[10px] mt-1.5 whitespace-nowrap font-medium transition-colors ${
                  isCancelled && isCurrent ? 'text-destructive' : isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-px mx-2 mt-4 transition-all duration-300">
                <div
                  className={`h-full transition-all duration-500 ${
                    isPast && !isCancelled ? 'bg-primary' : 'bg-border-subtle'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
