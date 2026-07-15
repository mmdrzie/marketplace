'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

export function useFavorites() {
  return useQuery({
    queryKey: queryKeys.favorites.all,
    queryFn: async () => {
      const res = await api.get('/favorites');
      return res.data;
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listingId: string | number) => {
      const res = await api.post(`/listings/${listingId}/favorite`);
      return res.data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.all });
      const previous = queryClient.getQueryData(queryKeys.favorites.all);
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.favorites.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}
