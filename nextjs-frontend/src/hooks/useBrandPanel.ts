'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Listing } from '@/types';
import type { Content } from '@/types';

export interface BrandCounters {
  activeListings: number;
  totalUsers: number;
  totalProvinces: number;
  approvedDealers: number;
  activeUsers: number;
}

export interface BrandStats {
  generatedAt: string;
  cacheFor: number;
  counters: BrandCounters;
  latest: Record<string, unknown>;
}

/** GET /stats/public — cache 60s. */
export function useBrandStats() {
  return useQuery({
    queryKey: ['brandPanel', 'stats'],
    queryFn: async () => {
      const res = await api.get('/stats/public');
      return res.data.data as BrandStats;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

/** GET /listings?sort=latest — cache 30s. */
export function useLatestListings() {
  return useQuery({
    queryKey: ['brandPanel', 'listings'],
    queryFn: async () => {
      const res = await api.get('/listings?sort=latest&per_page=4');
      return res.data.data as Listing[];
    },
    staleTime: 30_000,
    retry: 1,
  });
}

/** GET /listings?sort=latest&has_price=1 — cache 60s. */
export function useLatestPrices() {
  return useQuery({
    queryKey: ['brandPanel', 'prices'],
    queryFn: async () => {
      const res = await api.get('/listings?sort=latest&has_price=1&per_page=4');
      return res.data.data as Listing[];
    },
    staleTime: 60_000,
    retry: 1,
  });
}

/** GET /v2/contents?type=news — cache 5min. */
export function useLatestNews() {
  return useQuery({
    queryKey: ['brandPanel', 'news'],
    queryFn: async () => {
      const res = await api.get('/v2/contents?type=news&per_page=4');
      return res.data.data as Content[];
    },
    staleTime: 300_000,
    retry: 1,
  });
}
