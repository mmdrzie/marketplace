'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { type Province } from '@/types';

export function useProvinces() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const res = await api.get('/provinces');
      return res.data.data as Province[];
    },
    staleTime: 600000,
    retry: 2,
  });
}
