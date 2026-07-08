'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useSearch(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.search.results(params),
    queryFn: async () => {
      const res = await api.get('/search', { params });
      return res.data;
    },
    staleTime: 30000,
    retry: 0,
  });
}
