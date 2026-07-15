'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/common/Toast';

export function useServiceLogs(vehicleId: string) {
  return useQuery({
    queryKey: ['fleet', vehicleId, 'logs'],
    queryFn: async () => { const res = await api.get(`/dealer/fleet/${vehicleId}/logs`); return res.data.data; },
    enabled: !!vehicleId,
  });
}

export function useCreateServiceLog(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => { const res = await api.post(`/dealer/fleet/${vehicleId}/logs`, data); return res.data.data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fleet', vehicleId, 'logs'] }); toast({ type: 'success', title: 'ثبت شد', message: 'سرویس با موفقیت ثبت شد' }); },
  });
}
