'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import type { Listing } from '@/types';

export interface CompareItem extends Listing {
  attributes?: Array<{ name: string; label: string; value: string; unit?: string }>;
}

interface CompareState {
  items: CompareItem[];
  addItem: (listing: CompareItem) => void;
  removeItem: (id: string | number) => void;
  hasItem: (id: string | number) => boolean;
  clearAll: () => void;
}

export const useCompareStore = create<CompareState>()(
  devtools(
    persist(
    (set, get) => ({
      items: [],
      addItem: (listing) => {
        const { items } = get();
        if (items.length >= 4) return;
        if (items.some((i) => i.id === listing.id)) return;
        set({ items: [...items, listing] });
      },
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      hasItem: (id) => get().items.some((i) => i.id === id),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'compare-items',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => persisted as CompareState,
      partialize: (state) => ({
        items: state.items,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('compare-store rehydration failed:', error);
      },
    },
  ),
  { name: 'compare-items', enabled: process.env.NODE_ENV === 'development' },
)
);