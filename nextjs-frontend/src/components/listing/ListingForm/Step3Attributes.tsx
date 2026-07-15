'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { GlassSelect } from '@/components/common/GlassSelect';
import type { Attribute } from '@/types';
import { cn } from '@/lib/utils';

// استایل مشترک برای اینپوت‌ها و سلکت‌ها در تم دارک و لایت
const inputSelectClasses = "w-full px-4 py-3.5 glass-input rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300 appearance-none disabled:opacity-40 disabled:cursor-not-allowed";

interface Step3AttributesProps {
  categorySlug: string | null;
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function Step3Attributes({ categorySlug, values, onChange }: Step3AttributesProps) {

  const { data: apiAttrs } = useQuery({
    queryKey: queryKeys.attributes.byCategory(categorySlug),
    queryFn: async () => {
      const res = await api.get(`/categories/${categorySlug}/attributes`);
      return res.data.data;
    },
    enabled: !!categorySlug,
    retry: 1,
  });

  const attributes = apiAttrs as Attribute[] ?? [];

  const setValue = (name: string, value: string) => onChange({ ...values, [name]: value });

  return (
    <div className="animate-fade-in space-y-12">
      
      {/* بخش مشخصات فنی */}
      <div>
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">3</div>
            <span className="text-[11px] font-bold tracking-widest text-primary uppercase">STEP 3</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground mb-2">مشخصات فنی</h2>
          <p className="text-muted-foreground text-sm font-light">مشخصات دقیق وسیله نقلیه یا ماشین‌آلات خود را وارد کنید.</p>
        </div>

        {attributes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(attributes as Attribute[]).map((attr) => (
              <div key={attr.id} className={attr.type === 'boolean' ? 'flex items-end' : ''}>
                <div className="w-full">
                  <label className="block text-[11px] text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                    {attr.label}
                    {attr.is_required && <span className="text-destructive mr-1">*</span>}
                    {attr.unit && <span className="text-muted-foreground/70 text-[10px] mr-2 font-normal normal-case">({attr.unit})</span>}
                  </label>

                  {/* اینپوت متنی و عددی */}
                  {(attr.type === 'text' || attr.type === 'number') && (
                    <input 
                      type={attr.type} 
                      value={values[attr.name] || ''} 
                      onChange={(e) => setValue(attr.name, e.target.value)} 
                      className={inputSelectClasses} 
                      placeholder={attr.label} 
                    />
                  )}

                  {/* سلکت */}
                  {attr.type === 'select' && (
                    <GlassSelect
                      value={values[attr.name] || ''}
                      onChange={(val) => setValue(attr.name, val)}
                      options={attr.options?.map((opt: string) => ({ value: opt, label: opt })) || []}
                      placeholder="انتخاب کنید"
                    />
                  )}

                  {/* سوییچ بولین (بله/خیر) مدرن */}
                  {attr.type === 'boolean' && (
                    <div className="flex gap-2 bg-surface-2/40 border border-border-subtle rounded-full p-1.5 w-full max-w-xs">
                      <button
                        type="button"
                        onClick={() => setValue(attr.name, '1')}
                        className={cn(
                          'flex-1 py-2 rounded-full text-xs font-medium transition-all',
                          values[attr.name] === '1' ? 'bg-success/15 text-success shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        بله
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue(attr.name, '0')}
                        className={cn(
                          'flex-1 py-2 rounded-full text-xs font-medium transition-all',
                          values[attr.name] === '0' ? 'bg-destructive/15 text-destructive shadow-sm' : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        خیر
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 border border-border-subtle text-center">
            <p className="text-muted-foreground text-sm font-light">این دسته‌بندی مشخصات خاصی نیاز ندارد. می‌توانید مستقیم به مرحله بعد بروید.</p>
          </div>
        )}
      </div>

      {/* بخش مدارک مالکیت - حذف شد چون backend این قابلیت را ندارد */}
    </div>
  );
}