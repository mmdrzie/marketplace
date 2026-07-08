'use client';

import type { Bid } from '@/store/tenderStore';

interface BidCardProps {
  bid: Bid;
  isOwner?: boolean;
  onAccept?: (bidId: number) => void;
  onReject?: (bidId: number) => void;
}

export function BidCard({ bid, isOwner, onAccept, onReject }: BidCardProps) {
  const statusStyle = bid.status === 'accepted' ? 'border-success/30 bg-success/5'
    : bid.status === 'rejected' ? 'border-destructive/30 bg-destructive/5'
    : 'border-border-subtle bg-surface-2';

  const statusIcon = bid.status === 'accepted'
    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    : bid.status === 'rejected'
    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    : null;

  const statusLabel = bid.status === 'accepted' ? 'تأیید شده'
    : bid.status === 'rejected' ? 'رد شده'
    : 'در انتظار بررسی';

  const statusTextColor = bid.status === 'accepted' ? 'text-success'
    : bid.status === 'rejected' ? 'text-destructive'
    : 'text-warning';

  return (
    <div className={`rounded-2xl p-4 border ${statusStyle} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-bold text-foreground">{bid.dealerBusiness}</h4>
            <span className={`text-[10px] font-medium inline-flex items-center gap-1 ${statusTextColor}`}>{statusIcon}{statusLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground">{bid.dealerName}</p>
          <p className="text-xs text-foreground mt-2">{bid.description}</p>
          <div className="mt-2">
            <span className="text-lg font-black text-foreground">{bid.amount.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] text-muted-foreground mr-1">تومان</span>
          </div>
          <span className="text-[10px] text-muted-foreground block mt-1">
            {new Date(bid.createdAt).toLocaleDateString('fa-IR')}
          </span>
        </div>
      </div>

      {isOwner && bid.status === 'pending' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <button
            onClick={() => onAccept?.(bid.id)}
            className="flex-1 btn btn-sm text-xs bg-success/10 text-success border border-success/20 hover:bg-success/20 rounded-xl font-medium transition-all"
          >
            تأیید پیشنهاد
          </button>
          <button
            onClick={() => onReject?.(bid.id)}
            className="flex-1 btn btn-sm text-xs bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 rounded-xl font-medium transition-all"
          >
            رد پیشنهاد
          </button>
        </div>
      )}
    </div>
  );
}
