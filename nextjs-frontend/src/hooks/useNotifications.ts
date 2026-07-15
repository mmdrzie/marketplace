'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';

interface NotificationsQueryData {
  data?: Array<{ id: string; is_read: boolean }>;
  [key: string]: unknown;
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const res = await api.get('/notifications');
      return res.data;
    },
    staleTime: 60000,
    retry: 0,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const previous = queryClient.getQueryData(queryKeys.notifications.all);
      queryClient.setQueryData(queryKeys.notifications.all, (old: NotificationsQueryData | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((n) =>
            n.id === id ? { ...n, is_read: true } : n
          ),
        };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.put('/notifications/read-all');
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });
      const previous = queryClient.getQueryData(queryKeys.notifications.all);
      queryClient.setQueryData(queryKeys.notifications.all, (old: NotificationsQueryData | undefined) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((n) => ({ ...n, is_read: true })),
        };
      });
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.notifications.all, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
