'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import type { Content, ContentType, ContentCategory } from '@/types/content';

export function useContents(type?: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.contents.list({ type, ...params }),
    queryFn: async () => {
      const qp = new URLSearchParams();
      if (type) qp.set('type', type);
      Object.entries(params ?? {}).forEach(([k, v]) => {
        if (v !== undefined && v !== null) qp.set(k, String(v));
      });
      const qs = qp.toString();
      const res = await api.get(`/v2/contents${qs ? `?${qs}` : ''}`);
      return res.data.data as Content[];
    },
    staleTime: 120000,
  });
}

export function useContent(slug: string) {
  return useQuery({
    queryKey: queryKeys.contents.detail(slug),
    queryFn: async () => {
      const res = await api.get(`/v2/contents/${slug}`);
      return res.data.data as Content;
    },
    enabled: !!slug,
    staleTime: 120000,
  });
}

export function useContentTypes() {
  return useQuery({
    queryKey: queryKeys.contents.types,
    queryFn: async () => {
      const res = await api.get('/v2/contents/types');
      return res.data.data as ContentType[];
    },
    staleTime: 300000,
  });
}

export function useContentCategories(parentId?: number | null) {
  return useQuery({
    queryKey: queryKeys.contents.categories(parentId),
    queryFn: async () => {
      const qs = parentId !== undefined && parentId !== null ? `?parentId=${parentId}` : '';
      const res = await api.get(`/v2/contents/categories${qs}`);
      return res.data.data as ContentCategory[];
    },
    staleTime: 300000,
  });
}

export function useContentByEntity(entityType: string, entityId: number) {
  return useQuery({
    queryKey: queryKeys.contents.byEntity(entityType, entityId),
    queryFn: async () => {
      const res = await api.get(`/v2/contents/entity/${entityType}/${entityId}`);
      return res.data.data as Content[];
    },
    enabled: !!entityType && !!entityId,
    staleTime: 120000,
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: queryKeys.contents.bookmarks,
    queryFn: async () => {
      const res = await api.get('/v2/contents/bookmarks');
      return res.data.data as Content[];
    },
    staleTime: 60000,
  });
}

export function useRelatedContent(id: number) {
  return useQuery({
    queryKey: queryKeys.contents.related(id),
    queryFn: async () => {
      const res = await api.get(`/v2/contents/${id}/related`);
      return res.data.data as Content[];
    },
    enabled: !!id,
    staleTime: 120000,
  });
}

export function useCreateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await api.post('/v2/contents', data);
      return res.data.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.contents.all }); },
  });
}

export function useUpdateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Record<string, unknown> }) => {
      const res = await api.patch(`/v2/contents/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.contents.all }); },
  });
}

export function useDeleteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/v2/contents/${id}`);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.contents.all }); },
  });
}

export function useSaveContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contentId: number) => {
      await api.post(`/v2/contents/${contentId}/bookmark`);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.contents.bookmarks }); },
  });
}

export function useRemoveBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contentId: number) => {
      await api.delete(`/v2/contents/${contentId}/bookmark`);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: queryKeys.contents.bookmarks }); },
  });
}