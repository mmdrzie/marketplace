'use client';

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import type { Listing } from '@/types';

interface RecentlyViewedState {
  items: Listing[];
  addItem: (listing: Listing) => void;
  clearAll: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  devtools(
    persist(
    (set, get) => ({
      items: [],
      addItem: (listing) => {
        const { items } = get();
        const filtered = items.filter((i) => i.id !== listing.id);
        set({ items: [listing, ...filtered].slice(0, 10) });
      },
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed',
      version: 1,
      migrate: (persisted) => persisted as RecentlyViewedState,
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('recently-viewed-store rehydration failed:', error);
      },
    },
  ),
  { name: 'recently-viewed', enabled: process.env.NODE_ENV === 'development' },
),
);
