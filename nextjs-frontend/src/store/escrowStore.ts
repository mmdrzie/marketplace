'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

export type DealStatus = 'pending_payment' | 'payment_held' | 'under_review' | 'released' | 'cancelled';

export interface Deal {
  id: number;
  listingId: number;
  listingTitle: string;
  listingSlug: string;
  listingImage?: string;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  amount: number;
  status: DealStatus;
  createdAt: string;
  releasedAt?: string;
  updatedAt: string;
  notes?: string;
}

interface EscrowState {
  deals: Deal[];
  createDeal: (deal: Omit<Deal, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => Deal;
  updateStatus: (id: number, status: DealStatus) => void;
  getDealsByUser: (userId: number) => Deal[];
  getDeal: (id: number) => Deal | undefined;
}

export const useEscrowStore = create<EscrowState>()(
  devtools(
    persist(
    (set, get) => ({
      deals: [
        {
          id: 1,
          listingId: 1,
          listingTitle: 'بیل مکانیکی کوماتسو PC200-8',
          listingSlug: 'komatsu-pc200-8',
          listingImage: '',
          buyerId: 2,
          buyerName: 'علی رضایی',
          sellerId: 1,
          sellerName: 'محمد محمدی',
          amount: 3800000000,
          status: 'payment_held',
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 2,
          listingId: 3,
          listingTitle: 'لودر کاترپیلار 966',
          listingSlug: 'cat-966',
          listingImage: '',
          buyerId: 1,
          buyerName: 'محمد محمدی',
          sellerId: 3,
          sellerName: 'احمد احمدی',
          amount: 5200000000,
          status: 'pending_payment',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      createDeal: (deal) => {
        const newDeal: Deal = {
          ...deal,
          id: Date.now(),
          status: 'pending_payment',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ deals: [...s.deals, newDeal] }));
        return newDeal;
      },
      updateStatus: (id, status) => {
        set((s) => ({
          deals: s.deals.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status,
                  updatedAt: new Date().toISOString(),
                  releasedAt: status === 'released' ? new Date().toISOString() : d.releasedAt,
                }
              : d
          ),
        }));
      },
      getDealsByUser: (userId) => {
        return get().deals.filter((d) => d.buyerId === userId || d.sellerId === userId);
      },
      getDeal: (id) => {
        return get().deals.find((d) => d.id === id);
      },
    }),
    {
      name: 'escrow-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => persisted as EscrowState,
      partialize: (state) => ({
        deals: state.deals,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('escrow-store rehydration failed:', error);
      },
    },
  ),
  { name: 'escrow-storage', enabled: process.env.NODE_ENV === 'development' },
)
);

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
