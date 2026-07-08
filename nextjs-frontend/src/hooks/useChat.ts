'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { MOCK_CONVERSATIONS_RESPONSE, MOCK_CONVERSATIONS } from '@/lib/mockData';

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.conversations.all,
    queryFn: async () => {
      try {
        const res = await api.get('/conversations');
        return res.data;
      } catch {
        return MOCK_CONVERSATIONS_RESPONSE;
      }
    },
  });
}

export function useConversation(id: number) {
  return useQuery({
    queryKey: queryKeys.conversations.detail(id),
    queryFn: async () => {
      try {
        const res = await api.get(`/conversations/${id}`);
        return res.data.data;
      } catch {
        const conv = MOCK_CONVERSATIONS.find((c) => c.id === id);
        return conv || null;
      }
    },
    enabled: !!id,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { listing_id: number; message: string }) => {
      const res = await api.post('/conversations', data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
    onError: (err: unknown) => {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (code === 'PHONE_VERIFICATION_REQUIRED') {
        window.location.href = `/verify-phone?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      conversationId,
      body,
    }: {
      conversationId: number;
      body: string;
    }) => {
      const res = await api.post(`/conversations/${conversationId}/messages`, {
        body,
      });
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.all });
    },
    onError: (err: unknown) => {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code;
      if (code === 'PHONE_VERIFICATION_REQUIRED') {
        window.location.href = `/verify-phone?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    },
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: number) => {
      await api.put(`/conversations/${conversationId}/read`);
    },
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations.detail(conversationId) });
    },
  });
}
