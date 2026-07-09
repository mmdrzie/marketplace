'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

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

interface TenderState {
  tenders: Tender[];
  createTender: (data: Omit<Tender, 'id' | 'status' | 'createdAt' | 'bids'>) => Tender;
  addBid: (tenderId: number, bid: Omit<Bid, 'id' | 'status' | 'createdAt'>) => void;
  updateBidStatus: (tenderId: number, bidId: number, status: BidStatus) => void;
  updateTenderStatus: (tenderId: number, status: TenderStatus) => void;
  getTendersByUser: (userId: string | number) => Tender[];
  getDealerBids: (dealerId: string | number) => Bid[];
}

export const useTenderStore = create<TenderState>()(
  devtools(
    persist(
    (set, get) => ({
      tenders: [
        {
          id: 1,
          userId: 2,
          userName: 'علی رضایی',
          title: 'اجاره بیل مکانیکی برای پروژه ساختمانی',
          description: 'نیاز به ۲ دستگاه بیل مکانیکی ۲۰ تنی برای پروژه ساختمانی در تهران، مدت ۳ ماه',
          machineType: 'بیل مکانیکی',
          quantity: 2,
          duration: '۳ ماه',
          budgetMin: 300000000,
          budgetMax: 500000000,
          provinceId: 1,
          provinceName: 'تهران',
          status: 'open',
          type: 'rental',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
          bids: [
            { id: 1, tenderId: 1, dealerId: 1, dealerName: 'محمد محمدی', dealerBusiness: 'شرکت راه‌سازان', amount: 420000000, description: '۲ دستگاه PC200 با اپراتور مجرب', status: 'pending', createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: 2, tenderId: 1, dealerId: 3, dealerName: 'احمد احمدی', dealerBusiness: 'ماشین‌آلات صنعتی پارس', amount: 380000000, description: 'بیل مکانیکی کاترپیلار 320 با گارانتی', status: 'pending', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
          ],
        },
        {
          id: 2,
          userId: 4,
          userName: 'سعید کریمی',
          title: 'خرید لودر ۵ تن دست دوم',
          description: 'به دنبال یک دستگاه لودر ۵ تن با حداکثر ۵۰۰۰ ساعت کارکرد برای معدن شن و ماسه',
          machineType: 'لودر',
          quantity: 1,
          duration: '—',
          budgetMin: 1500000000,
          budgetMax: 2500000000,
          provinceId: 8,
          provinceName: 'اصفهان',
          status: 'open',
          type: 'purchase',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          deadline: new Date(Date.now() + 86400000 * 15).toISOString(),
          bids: [],
        },
        {
          id: 3,
          userId: 5,
          userName: 'رضا موسوی',
          title: 'قرارداد حمل مصالح با ۵ کامیون کمپرسی',
          description: 'نیاز به ۵ دستگاه کامیون کمپرسی برای حمل مصالح در پروژه آزادراه تهران-شمال',
          machineType: 'کامیون کمپرسی',
          quantity: 5,
          duration: '۶ ماه',
          budgetMin: 600000000,
          budgetMax: 900000000,
          provinceId: 1,
          provinceName: 'تهران',
          status: 'open',
          type: 'contract',
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
          bids: [
            { id: 3, tenderId: 3, dealerId: 1, dealerName: 'محمد محمدی', dealerBusiness: 'شرکت راه‌سازان', amount: 780000000, description: '۵ کامیون FH440 با راننده', status: 'pending', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
          ],
        },
      ],
      createTender: (data) => {
        const tender: Tender = {
          ...data,
          id: Date.now(),
          status: 'open',
          createdAt: new Date().toISOString(),
          bids: [],
        };
        set((s) => ({ tenders: [tender, ...s.tenders] }));
        return tender;
      },
      addBid: (tenderId, bidData) => {
        const bid: Bid = {
          ...bidData,
          id: Date.now(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          tenders: s.tenders.map((t) =>
            t.id === tenderId ? { ...t, bids: [...t.bids, bid] } : t
          ),
        }));
      },
      updateBidStatus: (tenderId, bidId, status) => {
        set((s) => ({
          tenders: s.tenders.map((t) =>
            t.id === tenderId
              ? { ...t, bids: t.bids.map((b) => (b.id === bidId ? { ...b, status } : b)) }
              : t
          ),
        }));
      },
      updateTenderStatus: (tenderId, status) => {
        set((s) => ({
          tenders: s.tenders.map((t) => (t.id === tenderId ? { ...t, status } : t)),
        }));
      },
      getTendersByUser: (userId) => {
        return get().tenders.filter((t) => t.userId === userId);
      },
      getDealerBids: (dealerId) => {
        return get().tenders.flatMap((t) => t.bids.filter((b) => b.dealerId === dealerId));
      },
    }),
    {
      name: 'tender-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => persisted as TenderState,
      partialize: (state) => ({
        tenders: state.tenders,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('tender-store rehydration failed:', error);
      },
    },
  ),
  { name: 'tender-storage', enabled: process.env.NODE_ENV === 'development' },
)
);

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
