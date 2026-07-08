'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { Attribute } from '@/types';

export function useAttributes(slug: string) {
  return useQuery({
    queryKey: queryKeys.attributes.byCategory(slug),
    queryFn: async () => {
      const res = await api.get(`/categories/${slug}/attributes`);
      return res.data.data as Attribute[];
    },
    enabled: !!slug,
  });
}
