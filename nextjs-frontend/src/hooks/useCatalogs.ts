'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

// --- Public hooks ---

export function useCatalogs() {
  return useQuery({
    queryKey: ['catalogs'],
    queryFn: async () => { const res = await api.get('/v2/catalogs'); return res.data.data; },
    staleTime: 10 * 60 * 1000,
  });
}

export function useCatalog(slug: string) {
  return useQuery({
    queryKey: ['catalogs', slug],
    queryFn: async () => { const res = await api.get(`/v2/catalogs/${slug}`); return res.data.data; },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCatalogCategories(slug: string) {
  return useQuery({
    queryKey: ['catalogs', slug, 'categories'],
    queryFn: async () => { const res = await api.get(`/v2/catalogs/${slug}/categories`); return res.data.data; },
    enabled: !!slug,
    staleTime: 30 * 1000,
  });
}

export function useCatalogParts(slug: string, params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ['catalogs', slug, 'parts', params],
    queryFn: async () => { const res = await api.get(`/v2/catalogs/${slug}/parts`, { params }); return res.data.data; },
    enabled: !!slug,
  });
}

export function useCatalogPart(slug: string, id: string) {
  return useQuery({
    queryKey: ['catalogs', slug, 'parts', id],
    queryFn: async () => { const res = await api.get(`/v2/catalogs/${slug}/parts/${id}`); return res.data.data; },
    enabled: !!slug && !!id,
  });
}

export function useCatalogPartStores(slug: string, id: string) {
  return useQuery({
    queryKey: ['catalogs', slug, 'parts', id, 'stores'],
    queryFn: async () => { const res = await api.get(`/v2/catalogs/${slug}/parts/${id}/stores`); return res.data.data; },
    enabled: !!slug && !!id,
  });
}

// --- Admin hooks ---

export function useAdminPartTypes() {
  return useQuery({
    queryKey: ['admin', 'part-types'],
    queryFn: async () => { const res = await api.get('/admin/part-types'); return res.data.data; },
    staleTime: 10 * 60 * 1000,
  });
}

export function useAdminCatalogTypes() {
  return useQuery({
    queryKey: ['admin', 'catalog-types'],
    queryFn: async () => { const res = await api.get('/admin/catalog-types'); return res.data.data; },
    staleTime: 10 * 60 * 1000,
  });
}

export function useAdminSetPartSpecs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, catalogTypeId, specs }: { id: number; catalogTypeId: number; specs: any }) => {
      const res = await api.put(`/admin/parts/${id}/specs`, { catalogTypeId, specs });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'parts'] }),
  });
}

export function useAdminCatalogCategories(type?: string) {
  return useQuery({
    queryKey: ['admin', 'catalog-categories', type],
    queryFn: async () => {
      const params = type ? { type } : undefined;
      const res = await api.get('/admin/catalog-categories', { params });
      return res.data.data;
    },
  });
}

export function useAdminCreateCatalogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => { const res = await api.post('/admin/catalog-categories', data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'catalog-categories'] }),
  });
}

export function useAdminUpdateCatalogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => { const res = await api.put(`/admin/catalog-categories/${id}`, data); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'catalog-categories'] }),
  });
}

export function useAdminDeleteCatalogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { await api.delete(`/admin/catalog-categories/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'catalog-categories'] }),
  });
}

export function useAdminRestoreCatalogCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => { const res = await api.put(`/admin/catalog-categories/${id}/restore`); return res.data.data; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'catalog-categories'] }),
  });
}
