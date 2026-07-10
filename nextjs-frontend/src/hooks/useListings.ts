'use client';

import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { ListingDetail } from '@/types';

export function useListings(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.listings.list(params),
    queryFn: async () => {
      const res = await api.get('/listings', { params });
      return res.data;
    },
    staleTime: 30000,
    retry: 2,
  });
}

export function useInfiniteListings(params?: Record<string, unknown>) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.listings.all, 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get('/listings', { params: { page: pageParam, per_page: 24, ...params } });
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta || lastPage.pagination || {};
      return current_page < last_page ? current_page + 1 : undefined;
    },
    staleTime: 30000,
    retry: 2,
  });
}

export function useListing(slug: string) {
  return useQuery({
    queryKey: queryKeys.listings.detail(slug),
    queryFn: async () => {
      const res = await api.get(`/listings/${slug}`);
      return res.data.data as ListingDetail;
    },
    enabled: !!slug,
    staleTime: 30000,
    retry: 2,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: queryKeys.listings.my,
    queryFn: async () => {
      const res = await api.get('/listings', { params: { scope: 'me' } });
      return res.data;
    },
    staleTime: 15000,
    retry: 2,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/listings', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.my });
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
    onError: (err: unknown) => {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (code === 'PHONE_VERIFICATION_REQUIRED') {
        window.location.href = `/verify-phone?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await api.put(`/listings/${id}`, data);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.my });
      if (data?.slug) {
        queryClient.invalidateQueries({ queryKey: queryKeys.listings.detail(data.slug) });
      }
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/listings/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.listings.my });
      const previous = queryClient.getQueryData(queryKeys.listings.my);
      queryClient.setQueryData(queryKeys.listings.my, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((item: any) => item.id !== id),
        };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.listings.my, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.my });
    },
  });
}

export function useSubmitListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/listings/${id}`, { action: 'submit' });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.my });
    },
    onError: (err: unknown) => {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (code === 'PHONE_VERIFICATION_REQUIRED') {
        window.location.href = `/verify-phone?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    },
  });
}

export function useMarkSold() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/listings/${id}`, { action: 'sold' });
      return res.data.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.listings.my });
      const previous = queryClient.getQueryData(queryKeys.listings.my);
      queryClient.setQueryData(queryKeys.listings.my, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item: any) =>
            item.id === id ? { ...item, status: 'sold' } : item
          ),
        };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.listings.my, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.my });
    },
  });
}

export function useRenewListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/listings/${id}`, { action: 'renew' });
      return res.data.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.listings.my });
      const previous = queryClient.getQueryData(queryKeys.listings.my);
      queryClient.setQueryData(queryKeys.listings.my, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((item: any) =>
            item.id === id ? { ...item, status: 'published' } : item
          ),
        };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.listings.my, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.my });
    },
  });
}
