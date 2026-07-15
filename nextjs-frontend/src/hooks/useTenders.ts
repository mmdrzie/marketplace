'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/common/Toast';

export function useTenders() {
  return useQuery({
    queryKey: ['tenders'],
    queryFn: async () => { const res = await api.get('/tenders'); return res.data.data; },
  });
}

export function useTender(slug: string) {
  return useQuery({
    queryKey: ['tenders', slug],
    queryFn: async () => { const res = await api.get(`/tenders/${slug}`); return res.data.data; },
    enabled: !!slug,
  });
}

export function useCreateTender() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => { const res = await api.post('/tenders', data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenders'] }); toast({ type: 'success', title: 'ثبت شد', message: 'درخواست با موفقیت ثبت شد' }); },
  });
}

export function usePlaceBid(tenderId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => { const res = await api.post(`/tenders/${tenderId}/bid`, data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tenders'] }); toast({ type: 'success', title: 'پیشنهاد ثبت شد' }); },
  });
}
