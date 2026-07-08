'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FadeIn } from '@/components/common/MotionDiv';
import { queryKeys } from '@/lib/queryKeys';

type Province = { id: number; name: string; slug: string };
type City = { id: number; name: string };

function SvgIcon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-4 w-4'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function AdminProvincesPage() {
  const queryClient = useQueryClient();
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [showProvinceForm, setShowProvinceForm] = useState(false);
  const [provinceName, setProvinceName] = useState('');
  const [provinceSlug, setProvinceSlug] = useState('');
  const [showCityForm, setShowCityForm] = useState(false);
  const [cityName, setCityName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'province' | 'city'; id: number; name: string } | null>(null);

  const { data: provinces, isLoading: loadingProv } = useQuery({
    queryKey: queryKeys.admin.provinces,
    queryFn: async () => { const res = await api.get('/provinces'); return res.data.data as Province[]; },
  });

  const { data: cities, isLoading: loadingCities } = useQuery({
    queryKey: queryKeys.admin.cities(selectedProvince),
    queryFn: async () => {
      const province = provinces?.find((p) => p.id === Number(selectedProvince));
      if (!province) return [];
      const res = await api.get(`/provinces/${province.slug}/cities`);
      return res.data.data as City[];
    },
    enabled: !!selectedProvince && !!provinces,
  });

  const createProvince = useMutation({
    mutationFn: async () => {
      await api.post('/provinces', { name: provinceName, slug: provinceSlug });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provinces });
      setShowProvinceForm(false);
      setProvinceName('');
      setProvinceSlug('');
    },
  });

  const deleteProvince = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/provinces/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.provinces });
      setSelectedProvince('');
      setDeleteTarget(null);
    },
  });

  const createCity = useMutation({
    mutationFn: async () => {
      const province = provinces?.find((p) => p.id === Number(selectedProvince));
      if (!province) return;
      await api.post(`/provinces/${province.id}/cities`, { name: cityName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.cities(selectedProvince) });
      setShowCityForm(false);
      setCityName('');
    },
  });

  const deleteCity = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/cities/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.cities(selectedProvince) });
      setDeleteTarget(null);
    },
  });

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">مدیریت استان‌ها و شهرها</h1>
          <button onClick={() => setShowProvinceForm(true)} className="btn btn-primary btn-sm">
            <SvgIcon><path d="M12 4v16m8-8H4" /></SvgIcon>
            استان جدید
          </button>
        </div>

        {loadingProv ? (
          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-surface-2 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-medium text-sm mb-3 text-foreground">استان‌ها ({provinces?.length || 0})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {provinces?.map((p) => (
                  <div key={p.id} className="relative group">
                    <button
                      onClick={() => setSelectedProvince(String(p.id))}
                      className={`w-full text-right px-3 py-2 rounded-xl text-sm transition-all ${selectedProvince === String(p.id) ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-2 hover:bg-surface-3 text-foreground border border-transparent'}`}
                    >
                      {p.name}
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'province', id: p.id, name: p.name })}
                      className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20"
                    >
                      <SvgIcon className="h-3 w-3 text-destructive"><path d="M6 6l12 12M18 6l-12 12" /></SvgIcon>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm text-foreground">
                  {selectedProvince ? `شهرها (${cities?.length || 0})` : 'یک استان انتخاب کنید'}
                </h3>
                {selectedProvince && (
                  <button onClick={() => setShowCityForm(true)} className="btn btn-ghost btn-sm">
                    <SvgIcon><path d="M12 4v16m8-8H4" /></SvgIcon>
                    شهر جدید
                  </button>
                )}
              </div>
              {loadingCities ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-surface-2 rounded-lg animate-pulse" />)}</div>
              ) : cities && cities.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {cities.map((city) => (
                    <div key={city.id} className="group relative px-3 py-2 bg-surface-2 rounded-xl text-sm text-foreground flex items-center justify-between">
                      <span>{city.name}</span>
                      <button
                        onClick={() => setDeleteTarget({ type: 'city', id: city.id, name: city.name })}
                        className="w-4 h-4 rounded-full bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 shrink-0"
                      >
                        <SvgIcon className="h-2.5 w-2.5 text-destructive"><path d="M6 6l12 12M18 6l-12 12" /></SvgIcon>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">استانی انتخاب نشده یا شهر ثبت نشده است</p>
              )}
            </div>
          </div>
        )}

        {/* Province form modal */}
        {showProvinceForm && (
          <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProvinceForm(false)}>
            <div className="glass rounded-2xl p-6 w-full max-w-sm border border-border-subtle shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-4">استان جدید</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">نام استان</label>
                  <input
                    value={provinceName}
                    onChange={(e) => setProvinceName(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                    placeholder="مثال: تهران"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">slug (لاتین)</label>
                  <input
                    value={provinceSlug}
                    onChange={(e) => setProvinceSlug(e.target.value)}
                    className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                    placeholder="مثال: tehran"
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowProvinceForm(false)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
                <button
                  onClick={() => createProvince.mutate()}
                  disabled={!provinceName || !provinceSlug || createProvince.isPending}
                  className="flex-1 py-2.5 btn btn-primary"
                >
                  {createProvince.isPending ? 'در حال ثبت...' : 'ثبت استان'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* City form modal */}
        {showCityForm && (
          <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCityForm(false)}>
            <div className="glass rounded-2xl p-6 w-full max-w-sm border border-border-subtle shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-4">شهر جدید</h3>
              <input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                className="w-full glass-input rounded-xl px-3 py-2 text-sm"
                placeholder="نام شهر"
              />
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowCityForm(false)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
                <button
                  onClick={() => createCity.mutate()}
                  disabled={!cityName || createCity.isPending}
                  className="flex-1 py-2.5 btn btn-primary"
                >
                  {createCity.isPending ? 'در حال ثبت...' : 'ثبت شهر'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirmation */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteTarget(null)}>
            <div className="glass rounded-2xl p-6 w-full max-w-sm border border-border-subtle shadow-2xl text-center" onClick={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <SvgIcon className="h-7 w-7 text-destructive"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></SvgIcon>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">حذف {deleteTarget.type === 'province' ? 'استان' : 'شهر'}</h3>
              <p className="text-sm text-muted-foreground mb-1">آیا از حذف <span className="font-medium text-foreground">{deleteTarget.name}</span> اطمینان دارید؟</p>
              <p className="text-xs text-destructive mb-5">این عمل قابل بازگشت نیست</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 btn btn-ghost">انصراف</button>
                <button
                  onClick={() => {
                    if (deleteTarget.type === 'province') deleteProvince.mutate(deleteTarget.id);
                    else deleteCity.mutate(deleteTarget.id);
                  }}
                  disabled={deleteProvince.isPending || deleteCity.isPending}
                  className="flex-1 py-2.5 btn btn-danger"
                >
                  {(deleteProvince.isPending || deleteCity.isPending) ? 'در حال حذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}
