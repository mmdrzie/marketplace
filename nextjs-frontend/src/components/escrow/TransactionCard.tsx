'use client';

import Link from 'next/link';
import type { Deal } from '@/store/escrowStore';
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS, DEAL_STATUS_BG } from '@/store/escrowStore';

interface TransactionCardProps {
  deal: Deal;
  isBuyer: boolean;
}

export function TransactionCard({ deal, isBuyer }: TransactionCardProps) {
  return (
    <Link
      href={`/dashboard/deals/${deal.id}`}
      className="block glass rounded-2xl p-4 border border-border-subtle hover:border-primary/20 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DEAL_STATUS_BG[deal.status]} ${DEAL_STATUS_COLORS[deal.status]}`}>
              {DEAL_STATUS_LABELS[deal.status]}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {new Date(deal.createdAt).toLocaleDateString('fa-IR')}
            </span>
          </div>
          <h3 className="text-sm font-bold text-foreground">{deal.listingTitle}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBuyer ? `فروشنده: ${deal.sellerName}` : `خریدار: ${deal.buyerName}`}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-black text-foreground">{deal.amount.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] text-muted-foreground">تومان</span>
          </div>
        </div>
        <svg className="h-5 w-5 text-muted-foreground shrink-0 mt-1 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
      </div>
    </Link>
  );
}
