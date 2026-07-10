'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from '@/components/common/Toast';

export function useFleet() {
  return useQuery({
    queryKey: ['fleet'],
    queryFn: async () => { const res = await api.get('/dealer/fleet'); return res.data.data; },
  });
}

export function useFleetVehicle(id: string) {
  return useQuery({
    queryKey: ['fleet', id],
    queryFn: async () => { const res = await api.get(`/dealer/fleet/${id}`); return res.data.data; },
    enabled: !!id,
  });
}

export function useCreateFleetVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => { const res = await api.post('/dealer/fleet', data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fleet'] }); toast({ type: 'success', title: 'ثبت شد', message: 'وسیله نقلیه با موفقیت اضافه شد' }); },
  });
}

export function useUpdateFleetVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => { const res = await api.put(`/dealer/fleet/${id}`, data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fleet'] }); toast({ type: 'success', title: 'ویرایش شد', message: 'اطلاعات به‌روزرسانی شد' }); },
  });
}

export function useDeleteFleetVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`/dealer/fleet/${id}`); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fleet'] }); toast({ type: 'success', title: 'حذف شد', message: 'وسیله نقلیه حذف شد' }); },
  });
}
