'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { type Category } from '@/types';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data as Category[];
    },
    staleTime: 300000,
    retry: 2,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      const res = await api.get('/categories');
      const categories = res.data.data as Category[];
      const roots = categories.filter((c) => c.parent_id === null);
      return roots.map((root) => ({
        ...root,
        children: categories.filter((c) => c.parent_id === root.id),
      }));
    },
    staleTime: 300000,
    retry: 2,
  });
}
