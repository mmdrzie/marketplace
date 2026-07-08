'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { MOCK_PROVINCES, MOCK_CITIES } from '@/lib/mockData';
import { GlassSelect } from '@/components/common/GlassSelect';
import { JSX } from 'react/jsx-runtime';

// آیکون‌های مدرن SVG برای فیلدها
const Icons = {
  text: <path d="M4 7V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2M9 20h6M12 4v16" />,
  tag: <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01" />,
  description: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />,
  map: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
};

const Icon = ({ path, className = "h-5 w-5" }: { path: JSX.Element; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

// استایل مشترک برای اینپوت‌ها و سلکت‌ها در تم دارک
const inputSelectClasses = "w-full px-4 py-3.5 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 appearance-none disabled:opacity-40 disabled:cursor-not-allowed";

type Step2Data = { title: string; description: string; price: string; price_type: string; province_id: string; city_id: string };

interface Step2BasicProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}

export function Step2Basic({ data, onChange }: Step2BasicProps) {
  const { data: apiProvinces } = useQuery({
    queryKey: queryKeys.categories.provinces,
    queryFn: async () => { const res = await api.get('/provinces'); return res.data.data; },
    retry: 1, staleTime: 60000,
  });

  const provinces = apiProvinces || MOCK_PROVINCES;

  const { data: apiCities } = useQuery({
    queryKey: queryKeys.categories.cities(data.province_id),
    queryFn: async () => {
      if (!data.province_id) return [];
      const province = (provinces as Array<{ id: number; slug: string; name: string }>)?.find((p) => p.id === Number(data.province_id));
      if (!province) return [];
      const res = await api.get(`/provinces/${province.slug}/cities`);
      return res.data.data;
    },
    enabled: !!data.province_id,
    retry: 1, staleTime: 60000,
  });

  const provinceId = data.province_id;
  const cities = apiCities || (provinceId ? (MOCK_CITIES[Number(provinceId)] || []) : []);

  const update = (field: string, value: string) => onChange({ ...data, [field]: value });

  return (
    <div className="animate-fade-in">
      {/* هدر مرحله */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-accent-blue-bg/10 border border-accent-blue-bg/20 flex items-center justify-center text-accent-blue font-bold text-sm">2</div>
          <span className="text-xs font-bold tracking-widest text-accent-blue uppercase">STEP 2</span>
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">اطلاعات پایه آگهی</h2>
        <p className="text-muted-foreground text-sm">عنوان، توضیحات و قیمت مناسب می‌تواند توجه خریداران بیشتری را جلب کند.</p>
      </div>

      <div className="space-y-6">
        
        {/* فیلد عنوان آگهی */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">عنوان آگهی <span className="text-destructive">*</span></label>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <Icon path={Icons.text} className="h-5 w-5" />
            </span>
            <input 
              type="text" 
              value={data.title} 
              onChange={(e) => update('title', e.target.value)} 
              className={`${inputSelectClasses} pr-12`} 
              placeholder="مثال: پراید ۱۱۱ مدل ۱۳۹۸" 
              maxLength={200} 
            />
          </div>
        </div>

        {/* فیلد توضیحات */}
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">توضیحات <span className="text-destructive">*</span></label>
          <div className="relative">
            <span className="absolute right-4 top-4 text-muted-foreground pointer-events-none">
              <Icon path={Icons.description} className="h-5 w-5" />
            </span>
            <textarea 
              value={data.description} 
              onChange={(e) => update('description', e.target.value)} 
              className={`${inputSelectClasses} pr-12 min-h-[140px] resize-y`} 
              placeholder="توضیحات کامل آگهی، وضعیت فنی، نواقص و امکانات..." 
              maxLength={5000} 
            />
          </div>
        </div>

        {/* قیمت و نوع قیمت */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">قیمت (تومان)</label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                <Icon path={Icons.tag} className="h-5 w-5" />
              </span>
              <input 
                type="number" 
                value={data.price} 
                onChange={(e) => update('price', e.target.value)} 
                className={`${inputSelectClasses} pr-12`} 
                placeholder="۱۵۰,۰۰۰,۰۰۰" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">نوع قیمت</label>
            <GlassSelect
              value={data.price_type}
              onChange={(val) => update('price_type', val)}
              options={[
                { value: 'fixed', label: 'ثابت' },
                { value: 'negotiable', label: 'توافقی' },
                { value: 'free', label: 'رایگان' },
              ]}
              placeholder="انتخاب کنید"
            />
          </div>
        </div>

        {/* استان و شهر */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">استان <span className="text-destructive">*</span></label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Icon path={Icons.map} className="h-5 w-5" />
              </span>
              <GlassSelect
                value={data.province_id}
                onChange={(val) => update('province_id', val)}
                options={(provinces as Array<{ id: number; name: string }>)?.map((p) => ({ value: String(p.id), label: p.name })) || []}
                placeholder="انتخاب استان"
                className="pr-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">شهر <span className="text-destructive">*</span></label>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                <Icon path={Icons.map} className="h-5 w-5" />
              </span>
              <GlassSelect
                value={data.city_id}
                onChange={(val) => update('city_id', val)}
                options={(cities as Array<{ id: number; name: string }>)?.map((c) => ({ value: String(c.id), label: c.name })) || []}
                placeholder="انتخاب شهر"
                disabled={!data.province_id}
                className="pr-10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}