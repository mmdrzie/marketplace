'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

export type ServiceType = 'repair' | 'maintenance' | 'oil_change' | 'part_replacement' | 'accident' | 'inspection';

export interface ServiceRecord {
  id: number;
  listingId: number;
  type: ServiceType;
  title: string;
  description: string;
  date: string;
  mileage?: number;
  cost: number;
  documents: { name: string; url: string }[];
  workshop?: string;
  createdAt: string;
}

interface ServiceLogState {
  records: ServiceRecord[];
  addRecord: (record: Omit<ServiceRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: number, data: Partial<ServiceRecord>) => void;
  deleteRecord: (id: number) => void;
  getRecordsByListing: (listingId: number) => ServiceRecord[];
}

export const useServiceLogStore = create<ServiceLogState>()(
  devtools(
    persist(
    (set, get) => ({
      records: [],
      addRecord: (record) => {
        const newRecord: ServiceRecord = {
          ...record,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ records: [...s.records, newRecord] }));
      },
      updateRecord: (id, data) => {
        set((s) => ({
          records: s.records.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }));
      },
      deleteRecord: (id) => {
        set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
      },
      getRecordsByListing: (listingId) => {
        return get().records.filter((r) => r.listingId === listingId);
      },
    }),
    {
      name: 'service-log-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => persisted as ServiceLogState,
      partialize: (state) => ({
        records: state.records,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('service-log-store rehydration failed:', error);
      },
    },
  ),
  { name: 'service-log-storage', enabled: process.env.NODE_ENV === 'development' },
)
);

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function persianDateToNum(dateStr: string): number {
  const ascii = dateStr.replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)));
  const num = parseInt(ascii.replace(/\D/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

export function getCurrentPersianMonthNum(): number {
  const now = new Date();
  const gYear = now.getFullYear();
  const gMonth = now.getMonth() + 1;
  const pYear = gMonth >= 3 ? gYear - 621 : gYear - 622;
  const pMonth = ((gMonth + 9) % 12) + 1;
  return pYear * 100 + pMonth;
}

const TYPE_WEIGHTS: Record<ServiceType, number> = {
  inspection: 5,
  oil_change: 4,
  maintenance: 3,
  part_replacement: 2,
  repair: 1,
  accident: -5,
};

export function calcHealthScore(records: ServiceRecord[]): number {
  if (!records.length) return 0;
  let score = 60;
  const sorted = [...records].sort((a, b) => persianDateToNum(b.date) - persianDateToNum(a.date));
  const recent = sorted.slice(0, 20);
  for (const r of recent) {
    score += TYPE_WEIGHTS[r.type] || 0;
  }
  score = Math.max(0, Math.min(100, score));
  return score;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  repair: 'تعمیرات',
  maintenance: 'سرویس دوره‌ای',
  oil_change: 'تعویض روغن',
  part_replacement: 'تعویض قطعه',
  accident: 'تصادف / حادثه',
  inspection: 'بازرسی فنی',
};

export const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  repair: 'bg-warning',
  maintenance: 'bg-accent-blue',
  oil_change: 'bg-success',
  part_replacement: 'bg-accent-indigo',
  accident: 'bg-destructive',
  inspection: 'bg-primary',
};
