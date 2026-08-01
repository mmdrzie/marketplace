'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// --- Public hooks ---

export function usePartsCategories() {
  return useQuery({
    queryKey: ['parts-categories'],
    queryFn: async () => { const res = await api.get('/v2/parts/categories'); return res.data.data; },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePartsCategory(slug: string) {
  return useQuery({
    queryKey: ['parts-categories', slug],
    queryFn: async () => { const res = await api.get(`/v2/parts/categories/${slug}`); return res.data.data; },
    enabled: !!slug,
  });
}

export function useParts(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['v2-parts', params],
    queryFn: async () => { const res = await api.get('/v2/parts', { params }); return res.data.data; },
  });
}

export function usePart(id: string) {
  return useQuery({
    queryKey: ['v2-parts', id],
    queryFn: async () => { const res = await api.get(`/v2/parts/${id}`); return res.data.data; },
    enabled: !!id,
  });
}

export function usePartStores(id: string) {
  return useQuery({
    queryKey: ['v2-parts', id, 'stores'],
    queryFn: async () => { const res = await api.get(`/v2/parts/${id}/stores`); return res.data.data; },
    enabled: !!id,
  });
}

export function useVehiclePartsSearch(brandId?: string, modelId?: number, year?: number) {
  return useQuery({
    queryKey: ['v2-parts', 'search-vehicle', brandId, modelId, year],
    queryFn: async () => {
      const params: Record<string, string> = { brand_id: brandId! };
      if (modelId) params.model_id = String(modelId);
      if (year) params.year = String(year);
      const res = await api.get('/v2/parts/search/vehicle', { params });
      return res.data.data;
    },
    enabled: !!brandId,
  });
}

export function useStores(q?: string) {
  return useQuery({
    queryKey: ['v2-stores', q],
    queryFn: async () => {
      const params = q ? { q } : undefined;
      const res = await api.get('/v2/parts/stores', { params });
      return res.data.data;
    },
  });
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: ['v2-stores', slug],
    queryFn: async () => { const res = await api.get(`/v2/parts/stores/${slug}`); return res.data.data; },
    enabled: !!slug,
  });
}

// --- Store owner hooks ---

export function useStoreProfile() {
  return useQuery({
    queryKey: ['store', 'profile'],
    queryFn: async () => { const res = await api.get('/store/profile'); return res.data.data; },
  });
}

export function useRegisterStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/store/register', data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store', 'profile'] }),
  });
}

export function useUpdateStoreProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { const res = await api.put('/store/profile', data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store', 'profile'] }),
  });
}

export function useStoreSuggestions() {
  return useQuery({
    queryKey: ['store', 'suggestions'],
    queryFn: async () => { const res = await api.get('/store/suggestions'); return res.data.data; },
  });
}

export function useCreateSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/store/suggestions', data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['store', 'suggestions'] }),
  });
}

// --- Admin hooks ---

export function useAdminStores(status?: string) {
  return useQuery({
    queryKey: ['admin', 'stores', status],
    queryFn: async () => {
      const params = status ? { status } : undefined;
      const res = await api.get('/admin/stores', { params });
      return res.data.data;
    },
  });
}

export function useAdminApproveStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => { const res = await api.put(`/admin/stores/${userId}/approve`); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'stores'] }),
  });
}

export function useAdminRejectStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, note }: { userId: string; note: string }) => {
      const res = await api.put(`/admin/stores/${userId}/reject`, { note });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'stores'] }),
  });
}

export function useAdminParts(q?: string, partTypeId?: number) {
  return useQuery({
    queryKey: ['admin', 'parts', q, partTypeId],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (q) params.q = q;
      if (partTypeId) params.part_type_id = partTypeId;
      const res = await api.get('/admin/parts', { params });
      return res.data.data;
    },
  });
}

export function useAdminCreatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/admin/parts', data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts'] }),
  });
}

export function useAdminUpdatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => { const res = await api.put(`/admin/parts/${id}`, data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts'] }),
  });
}

export function useAdminDeletePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { await api.delete(`/admin/parts/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts'] }),
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin', 'parts-categories'],
    queryFn: async () => { const res = await api.get('/admin/parts-categories'); return res.data.data; },
  });
}

export function useAdminCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/admin/parts-categories', data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts-categories'] }),
  });
}

export function useAdminUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => { const res = await api.put(`/admin/parts-categories/${id}`, data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts-categories'] }),
  });
}

export function useAdminDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { await api.delete(`/admin/parts-categories/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts-categories'] }),
  });
}

export function useAdminSuggestions(status?: string) {
  return useQuery({
    queryKey: ['admin', 'suggestions', status],
    queryFn: async () => {
      const params = status ? { status } : undefined;
      const res = await api.get('/admin/parts/suggestions', { params });
      return res.data.data;
    },
  });
}

export function useAdminApproveSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { const res = await api.put(`/admin/parts/suggestions/${id}/approve`); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'suggestions'] }),
  });
}

export function useAdminRejectSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: number; note: string }) => {
      const res = await api.put(`/admin/parts/suggestions/${id}/reject`, { note });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'suggestions'] }),
  });
}
