import api from '@/lib/api';

async function getQueryClient() {
  const mod = await import('@/providers/QueryProvider');
  return mod.queryClient;
}

export async function prefetchListings(page = 1, params?: Record<string, unknown>) {
  const qc = await getQueryClient();
  if (!qc) return;
  await qc.prefetchQuery({
    queryKey: ['listings', 'all', page, params ? JSON.stringify(params) : ''],
    queryFn: async () => { const res = await api.get('/listings', { params: { page, per_page: 24, ...params } }); return res.data; },
    staleTime: 30000,
  });
}

export async function prefetchCategories() {
  const qc = await getQueryClient();
  if (!qc) return;
  await qc.prefetchQuery({
    queryKey: ['categories'],
    queryFn: async () => { const res = await api.get('/categories'); return res.data.data; },
    staleTime: 300000,
  });
}

export async function prefetchProvinces() {
  const qc = await getQueryClient();
  if (!qc) return;
  await qc.prefetchQuery({
    queryKey: ['provinces'],
    queryFn: async () => { const res = await api.get('/provinces'); return res.data.data; },
    staleTime: 300000,
  });
}

export async function prefetchListingDetail(slug: string) {
  const qc = await getQueryClient();
  if (!qc) return;
  await qc.prefetchQuery({
    queryKey: ['listings', 'detail', slug],
    queryFn: async () => { const res = await api.get(`/listings/${slug}`); return res.data.data; },
    staleTime: 30000,
  });
}
