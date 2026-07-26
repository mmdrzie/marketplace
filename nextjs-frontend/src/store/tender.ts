export type TenderType = 'rental' | 'purchase' | 'contract';
export type TenderStatus = 'open' | 'closed' | 'awarded' | 'cancelled';
export type BidStatus = 'pending' | 'accepted' | 'rejected';

export interface Bid {
  id: number;
  tenderId: number;
  dealerId: string | number;
  dealerName: string;
  dealerBusiness: string;
  amount: number;
  description: string;
  status: BidStatus;
  createdAt: string;
}

export interface Tender {
  id: number;
  userId: string | number;
  userName: string;
  title: string;
  description: string;
  machineType: string;
  quantity: number;
  duration: string;
  budgetMin: number;
  budgetMax: number;
  provinceId: number;
  provinceName: string;
  status: TenderStatus;
  type: TenderType;
  createdAt: string;
  deadline: string;
  bids: Bid[];
}

export const TENDER_TYPE_LABELS: Record<TenderType, string> = {
  rental: 'اجاره',
  purchase: 'خرید',
  contract: 'قرارداد',
};

export const TENDER_STATUS_LABELS: Record<TenderStatus, string> = {
  open: 'دریافت پیشنهاد',
  closed: 'پایان مهلت',
  awarded: 'اختصاص یافته',
  cancelled: 'لغو شده',
};

export const TENDER_STATUS_COLORS: Record<TenderStatus, string> = {
  open: 'text-success',
  closed: 'text-warning',
  awarded: 'text-accent-blue',
  cancelled: 'text-destructive',
};

export const TENDER_STATUS_BG: Record<TenderStatus, string> = {
  open: 'bg-success/10 border-success/20',
  closed: 'bg-warning/10 border-warning/20',
  awarded: 'bg-accent-blue-bg border-accent-blue-border',
  cancelled: 'bg-destructive/10 border-destructive/20',
};
