'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { MOCK_ARTICLES } from '@/lib/mockData';
import type { Article } from '@/types';

export function useArticles() {
  return useQuery({
    queryKey: queryKeys.articles.all,
    queryFn: async () => {
      const res = await api.get('/articles');
      return res.data.data as Article[];
    },
    staleTime: 120000,
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(slug),
    queryFn: async () => {
      try {
        const res = await api.get(`/articles/${slug}`);
        return res.data.data as Article;
      } catch {
        return MOCK_ARTICLES.find((a) => a.slug === slug) || null;
      }
    },
    enabled: !!slug,
    staleTime: 120000,
  });
}
