'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const WORKSHOP_TYPE_LABELS: Record<string, string> = {
  mechanic: 'تعمیرکار',
  tuner: 'تیونر',
  both: 'تعمیرکار و تیونر',
};

// --- Public ---

export function useWorkshops(params?: { q?: string; type?: string; city?: string }) {
  return useQuery({
    queryKey: ['workshops', params],
    queryFn: async () => {
      const res = await api.get('/v2/workshops', { params });
      return res.data.data as { rows: any[]; total: number };
    },
  });
}

export function useWorkshopCities() {
  return useQuery({
    queryKey: ['workshops', 'cities'],
    queryFn: async () => {
      const res = await api.get('/v2/workshops/cities');
      return res.data.data as string[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useWorkshop(slug: string) {
  return useQuery({
    queryKey: ['workshops', slug],
    queryFn: async () => {
      const res = await api.get(`/v2/workshops/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });
}

// --- Owner ---

export function useMyWorkshop() {
  return useQuery({
    queryKey: ['workshops', 'my'],
    queryFn: async () => {
      const res = await api.get('/v2/workshops/my');
      return res.data.data;
    },
    retry: false,
  });
}

export function useRegisterWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/v2/workshops', data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workshops', 'my'] }),
  });
}

export function useUpdateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.put('/v2/workshops/my', data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workshops', 'my'] }),
  });
}

// --- Admin ---

export function useAdminWorkshops(status?: string) {
  return useQuery({
    queryKey: ['admin', 'workshops', status],
    queryFn: async () => {
      const params = status ? { status } : undefined;
      const res = await api.get('/admin/workshops', { params });
      return res.data.data;
    },
  });
}

export function useAdminApproveWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.put(`/admin/workshops/${userId}/approve`);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'workshops'] }),
  });
}

export function useAdminRejectWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, note }: { userId: string; note: string }) => {
      const res = await api.put(`/admin/workshops/${userId}/reject`, { note });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'workshops'] }),
  });
}

export function useAdminSuspendWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.put(`/admin/workshops/${userId}/suspend`);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'workshops'] }),
  });
}

export function useAdminUpdateWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, ...data }: { userId: string } & Record<string, unknown>) => {
      const res = await api.put(`/admin/workshops/${userId}`, data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'workshops'] }),
  });
}

export function useAdminDeleteWorkshop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/workshops/${userId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'workshops'] }),
  });
}
