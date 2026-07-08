'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { useMemo, useState } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { queryKeys } from '@/lib/queryKeys';

const spring = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.8 };

const ICONS = {
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  crown: <path d="M2 19h20M4 19V9l7 4 5-4 5 4v10" />,
  check: <polyline points="20 6 9 17 4 12" />,
  plus: <><circle cx="12" cy="12" r="10" /><path d="M12 8v8M8 12h8" /></>,
  bolt: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
  chart: <path d="M3 3v18h18" />,
  headset: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />,
  gem: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
};

function Icon({ d, className = 'h-5 w-5' }: { d: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const BASE_PLANS = [
  {
    id: 'basic', name: 'پایه', description: 'برای شروع کار',
    monthlyPrice: 200000, yearlyPrice: 180000,
    listings: 50, features: ['۵۰ آگهی فعال', 'پشتیبانی پیامکی', 'آمار بازدید'],
    icon: ICONS.shield, color: 'text-primary',
  },
  {
    id: 'professional', name: 'حرفه‌ای', description: 'برای کسب‌وکار فعال',
    monthlyPrice: 500000, yearlyPrice: 420000,
    listings: 200, features: ['۲۰۰ آگهی فعال', 'پشتیبانی پیامکی و تلفنی', 'آمار پیشرفته', 'ویترین اختصاصی'],
    icon: ICONS.star, color: 'text-warning', popular: true,
  },
  {
    id: 'enterprise', name: 'سازمانی', description: 'برای شرکت‌های بزرگ',
    monthlyPrice: 1500000, yearlyPrice: 1200000,
    listings: 'نامحدود', features: ['آگهی نامحدود', 'پشتیبانی ۲۴ ساعته', 'گزارش‌های تحلیلی', 'اولویت در نتایج', 'API اختصاصی'],
    icon: ICONS.crown, color: 'text-destructive',
  },
];

const ADDONS = [
  { id: 'extra_listings', label: '+۵۰ آگهی اضافه', price: 80000, icon: ICONS.plus },
  { id: 'priority_support', label: 'پشتیبانی Priority', price: 120000, icon: ICONS.headset },
  { id: 'analytics_pro', label: 'گزارش‌های پرو', price: 150000, icon: ICONS.chart },
  { id: 'featured_showcase', label: 'ویترین ویژه', price: 200000, icon: ICONS.gem },
];

function formatPrice(amount: number) {
  return amount.toLocaleString('fa-IR');
}

export default function DealerSubscriptionPage() {
  const { user } = useAuthStore();
  const isAgency = user?.role === 'agency';
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.dealers.subscription,
    queryFn: async () => { const res = await api.get('/dealer/subscription'); return res.data; },
  });

  const initPayment = useMutation({
    mutationFn: async (payload: { plan: string; cycle: string; addons: string[] }) => {
      const res = await api.post('/payments/dealer-subscription', payload);
      return res.data.data;
    },
    onSuccess: (data) => { window.location.href = data.payment_url; },
  });

  const subscription = data?.data;

  const plan = BASE_PLANS.find((p) => p.id === selectedPlan)!;
  const basePrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce((sum, id) => {
      const addon = ADDONS.find((a) => a.id === id);
      return sum + (addon?.price || 0);
    }, 0);
  }, [selectedAddons]);
  const totalPrice = basePrice + addonsTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 p-5 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">اشتراک {isAgency ? 'بنگاه' : 'نمایندگی'}</h1>
        <p className="text-sm text-muted-foreground mt-1">طرح و افزونه‌های مناسب کسب‌وکار خود را انتخاب کنید</p>
      </div>

      {subscription && (
        <div className={cn('rounded-2xl border p-5', isAgency ? 'bg-warning/5 border-warning/20' : 'bg-success/5 border-success/20')}>
          <div className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', isAgency ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success')}>
              <Icon d={ICONS.star} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">اشتراک فعلی: <span className="font-bold">{subscription.plan_name || 'پایه'}</span></p>
              {subscription.subscription_expires_at && (
                <p className="text-xs text-muted-foreground mt-0.5">اعتبار تا {new Date(subscription.subscription_expires_at).toLocaleDateString('fa-IR')}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing Toggle */}
      <div className="bg-surface-2/60 p-1 h-11 w-full max-w-xs rounded-xl ring-1 ring-border flex">
        {(['monthly', 'yearly'] as const).map((cycle) => (
          <button
            key={cycle}
            onClick={() => setBillingCycle(cycle)}
            className={cn(
              'flex-1 h-full rounded-lg text-sm font-medium relative transition-colors duration-300 flex items-center justify-center gap-2',
              billingCycle === cycle ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {billingCycle === cycle && (
              <motion.div
                layoutId="billing-bg"
                className="absolute inset-0 bg-surface-1 rounded-lg shadow-sm ring-1 ring-border"
                transition={spring}
              />
            )}
            <span className="relative z-10">{cycle === 'monthly' ? 'ماهیانه' : 'سالانه'}</span>
            {cycle === 'yearly' && (
              <span className="relative z-10 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">۱۰٪ تخفیف</span>
            )}
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-56 bg-surface-2 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <LayoutGroup>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {BASE_PLANS.map((p) => {
              const isSelected = selectedPlan === p.id;
              const isCurrent = subscription?.subscription_plan === p.id;
              const price = billingCycle === 'monthly' ? p.monthlyPrice : p.yearlyPrice;
              const period = billingCycle === 'monthly' ? 'ماه' : 'سال';

              return (
                <motion.div
                  key={p.id}
                  layout
                  onClick={() => !isCurrent && setSelectedPlan(p.id)}
                  className={cn(
                    'relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden',
                    isSelected
                      ? 'z-10 border-primary/50 shadow-[0_0_25px_-10px_var(--color-primary)]'
                      : 'border-border/60 hover:border-border bg-surface-1/40',
                    isCurrent && 'opacity-60 pointer-events-none'
                  )}
                >
                  {/* Hover glow */}
                  <div className={cn(
                    'absolute -inset-[1px] rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none',
                    isSelected && 'opacity-100'
                  )} style={{ background: 'radial-gradient(ellipse at top, var(--color-primary)/8, transparent 70%)' }} />

                  <div className="relative p-5 flex flex-col h-full">
                    {p.popular && !isCurrent && (
                      <div className="absolute -top-2.5 right-4 bg-primary text-primary-foreground text-[9px] font-bold px-3 py-1 rounded-full shadow-md z-10">
                        محبوب
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', isSelected ? `${isAgency ? 'bg-warning/10' : 'bg-success/10'} ${p.color}` : 'bg-surface-2 text-muted-foreground')}>
                        <Icon d={p.icon} className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-foreground">{formatPrice(price)}</span>
                      <span className="text-sm text-muted-foreground mr-1">تومان / {period}</span>
                    </div>

                    {/* Radio dot */}
                    <div className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 mb-4',
                      isSelected ? 'border-primary' : 'border-border'
                    )}>
                      <AnimatePresence mode="wait">
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="w-3 h-3 rounded-full bg-primary"
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Mini features preview */}
                    <div className="flex flex-col gap-1.5 flex-1">
                      {p.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Icon d={ICONS.check} className="h-3 w-3 text-success shrink-0" />
                          {f}
                        </div>
                      ))}
                    </div>

                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 mt-3 text-xs text-muted-foreground bg-surface-2 px-2.5 py-1 rounded-full border border-border w-fit">
                        <Icon d={ICONS.check} className="h-3 w-3 text-success" />
                        طرح فعلی
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>
      )}

      <AnimatePresence mode="wait">
        {selectedPlan && (
          <motion.div
            key={selectedPlan + billingCycle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="rounded-2xl border border-border/60 bg-surface-1/40 backdrop-blur-sm p-6 space-y-6"
          >
            {/* Plan features */}
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 tracking-tight">ویژگی‌های {plan.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plan.features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="flex items-center gap-3 text-sm text-foreground/80 p-3 rounded-xl bg-surface-2/30 border border-border/30"
                  >
                    <Icon d={ICONS.check} className={cn('h-4 w-4 shrink-0', isAgency ? 'text-warning' : 'text-success')} />
                    {f}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Customization — Add-ons */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon d={ICONS.bolt} className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">شخصی‌سازی</h3>
                <span className="text-[10px] text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full border border-border">اختیاری</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ADDONS.map((addon, i) => {
                  const active = selectedAddons.includes(addon.id);
                  return (
                    <motion.button
                      key={addon.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 + 0.15 }}
                      onClick={() => toggleAddon(addon.id)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border text-right transition-all',
                        active
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border/30 bg-surface-2/20 hover:bg-surface-2/40 hover:border-border'
                      )}
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all',
                        active ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-muted-foreground'
                      )}>
                        <Icon d={addon.icon} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-right">
                        <p className={cn('text-sm font-medium transition-colors', active ? 'text-foreground' : 'text-muted-foreground')}>{addon.label}</p>
                        <p className="text-xs text-muted-foreground/60">{formatPrice(addon.price)} تومان / {billingCycle === 'monthly' ? 'ماه' : 'سال'}</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                        active ? 'border-primary bg-primary' : 'border-border'
                      )}>
                        {active && <Icon d={ICONS.check} className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Price summary & CTA */}
            <div className="rounded-xl bg-surface-2/40 border border-border/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">مجموع پرداخت</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  {formatPrice(totalPrice)}
                  <span className="text-sm font-normal text-muted-foreground mr-1">تومان</span>
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  {plan.name} — {billingCycle === 'monthly' ? 'ماهیانه' : 'سالانه'}
                  {selectedAddons.length > 0 && ` + ${selectedAddons.length} افزونه`}
                </p>
              </div>
              <button
                onClick={() => initPayment.mutate({ plan: selectedPlan, cycle: billingCycle, addons: selectedAddons })}
                disabled={initPayment.isPending}
                className="btn btn-primary py-2.5 px-8 rounded-xl text-sm font-medium whitespace-nowrap"
              >
                {initPayment.isPending ? 'اتصال به درگاه...' : 'ادامه و پرداخت'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
