export type DealStatus = 'pending_payment' | 'payment_held' | 'under_review' | 'released' | 'cancelled';

export interface Deal {
  id: number;
  listingId: number;
  listingTitle: string;
  listingSlug: string;
  listingImage?: string;
  buyerId: string | number;
  buyerName: string;
  sellerId: string | number;
  sellerName: string;
  amount: number;
  status: DealStatus;
  createdAt: string;
  releasedAt?: string;
  updatedAt: string;
  notes?: string;
}

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  pending_payment: 'در انتظار پرداخت',
  payment_held: 'وجه بلوکه شده',
  under_review: 'در حال بررسی',
  released: 'آزادسازی شده',
  cancelled: 'لغو شده',
};

export const DEAL_STATUS_COLORS: Record<DealStatus, string> = {
  pending_payment: 'text-warning',
  payment_held: 'text-accent-blue',
  under_review: 'text-accent-indigo',
  released: 'text-success',
  cancelled: 'text-destructive',
};

export const DEAL_STATUS_BG: Record<DealStatus, string> = {
  pending_payment: 'bg-warning/10 border-warning/20',
  payment_held: 'bg-accent-blue-bg border-accent-blue-border',
  under_review: 'bg-accent-indigo/10 border-accent-indigo/20',
  released: 'bg-success/10 border-success/20',
  cancelled: 'bg-destructive/10 border-destructive/20',
};
