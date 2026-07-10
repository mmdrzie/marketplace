'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useParts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['parts', params],
    queryFn: async () => { const res = await api.get('/parts', { params }); return res.data.data; },
  });
}

export function usePart(id: string) {
  return useQuery({
    queryKey: ['parts', id],
    queryFn: async () => { const res = await api.get(`/parts/${id}`); return res.data.data; },
    enabled: !!id,
  });
}
