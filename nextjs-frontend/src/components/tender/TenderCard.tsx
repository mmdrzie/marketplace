'use client';

import { memo } from 'react';
import Link from 'next/link';
import type { Tender } from '@/store/tenderStore';
import { TENDER_TYPE_LABELS, TENDER_STATUS_LABELS, TENDER_STATUS_COLORS, TENDER_STATUS_BG } from '@/store/tenderStore';

interface TenderCardProps {
  tender: Tender;
  showActions?: boolean;
}

export const TenderCard = memo(function TenderCard({ tender, showActions }: TenderCardProps) {
  const isExpired = new Date(tender.deadline) < new Date();

  return (
    <Link
      href={`/tenders/${tender.id}`}
      className="block glass rounded-2xl p-5 border border-border-subtle hover:border-primary/20 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TENDER_STATUS_BG[tender.status]} ${TENDER_STATUS_COLORS[tender.status]}`}>
          {TENDER_STATUS_LABELS[tender.status]}
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {TENDER_TYPE_LABELS[tender.type]}
        </span>
      </div>

      <h3 className="text-sm font-bold text-foreground leading-snug mb-1">{tender.title}</h3>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground mt-2">
        <span className="flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
          {tender.machineType}
        </span>
        {tender.quantity > 1 && (
          <span className="flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            {tender.quantity} دستگاه
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          {tender.provinceName}
        </span>
        <span className="flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          {new Date(tender.deadline).toLocaleDateString('fa-IR')}
        </span>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">{tender.userName}</span>
        <span className="text-sm font-black text-foreground">
          {tender.budgetMin.toLocaleString('fa-IR')} - {tender.budgetMax.toLocaleString('fa-IR')}
          <span className="text-[9px] text-muted-foreground font-normal mr-0.5">تومان</span>
        </span>
      </div>

      {isExpired && tender.status === 'open' && (
        <div className="mt-2 text-[10px] text-destructive flex items-center gap-1">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          مهلت پیشنهاد به اتمام رسیده
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Link href={`/tenders/${tender.id}`} className="flex-1 btn btn-glass btn-sm text-xs">مشاهده</Link>
        </div>
      )}
    </Link>
  );
});
