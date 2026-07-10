'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/common/Toast';

export function useEscrowDeals() {
  return useQuery({
    queryKey: ['escrow'],
    queryFn: async () => { const res = await api.get('/escrow'); return res.data.data; },
  });
}

export function useEscrowDeal(id: string) {
  return useQuery({
    queryKey: ['escrow', id],
    queryFn: async () => { const res = await api.get(`/escrow/${id}`); return res.data.data; },
    enabled: !!id,
  });
}

export function useCreateEscrowDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => { const res = await api.post('/escrow', data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['escrow'] }); toast({ type: 'success', title: 'معامله ایجاد شد', message: 'معامله با موفقیت ثبت شد' }); },
  });
}

export function useUpdateEscrowDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => { const res = await api.patch(`/escrow/${id}`, data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['escrow'] }); toast({ type: 'success', title: 'به‌روزرسانی شد', message: 'وضعیت معامله تغییر کرد' }); },
  });
}
