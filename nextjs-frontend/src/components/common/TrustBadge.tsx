'use client';

import { cn } from '@/lib/utils';

type BadgeTier = 'bronze' | 'silver' | 'gold';

interface TrustBadgeProps {
  tier?: BadgeTier;
  score?: number;
  deals?: number;
  verified?: boolean;
  className?: string;
}

const TIER_CONFIG: Record<BadgeTier, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  bronze: { label: 'برنز', bg: 'bg-warning/20 border-warning/30', text: 'text-warning', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
  ) },
  silver: { label: 'نقره', bg: 'bg-muted/20 border-muted/30', text: 'text-muted-foreground', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
  ) },
  gold: { label: 'طلایی', bg: 'bg-warning/20 border-warning/30', text: 'text-warning', icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
  ) },
};

export function TrustBadge({ tier = 'bronze', score, deals, verified, className }: TrustBadgeProps) {
  const cfg = TIER_CONFIG[tier];

  return (
    <div className={cn('group relative', className)}>
      <div className={cn('inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border', cfg.bg, cfg.text)}>
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
        {verified && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </div>

      {score !== undefined && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 glass rounded-xl border border-border-subtle p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">امتیاز اعتماد</span>
              <span className="font-bold text-foreground">{score}/۱۰۰</span>
            </div>
            <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', score >= 80 ? 'bg-warning' : score >= 50 ? 'bg-muted' : 'bg-warning')}
                style={{ width: `${score}%` }}
              />
            </div>
            {deals !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">معاملات موفق</span>
                <span className="font-bold text-foreground">{deals.toLocaleString('fa-IR')}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">تأیید هویت</span>
              <span className={verified ? 'text-success' : 'text-destructive'}>{verified ? 'تأیید شده' : 'تأیید نشده'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function getTier(deals?: number): BadgeTier {
  if (!deals || deals < 5) return 'bronze';
  if (deals < 20) return 'silver';
  return 'gold';
}

export function getScore(verified?: boolean, deals?: number, hasSubscription?: boolean): number {
  let score = 0;
  if (verified) score += 30;
  if (deals) score += Math.min(deals * 3, 50);
  if (hasSubscription) score += 20;
  return Math.min(score, 100);
}
