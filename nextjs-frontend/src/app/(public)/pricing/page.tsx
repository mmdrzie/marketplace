'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsAuthenticated } from '@/store/authStore';

const spring = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.8 };

function Icon({ d, className = 'h-5 w-5' }: { d: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  );
}

const ICONS = {
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  crown: <path d="M2 19h20M4 19V9l7 4 5-4 5 4v10" />,
  check: <polyline points="20 6 9 17 4 12" />,
  x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
  bolt: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
  chart: <path d="M3 3v18h18" />,
  headset: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />,
  gem: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  zap: <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
  infinity: <><path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" /></>,
};

interface PlanFeature {
  label: string;
  basic: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
}

const PLANS = [
  {
    id: 'basic',
    name: 'پایه',
    description: 'برای فروشندگان تازه‌کار',
    monthlyPrice: 200000,
    yearlyPrice: 180000,
    icon: ICONS.shield,
    gradient: 'from-primary/20 to-primary/5',
    accentColor: 'text-primary',
    bgAccent: 'bg-primary/10',
  },
  {
    id: 'professional',
    name: 'حرفه‌ای',
    description: 'برای کسب‌وکارهای فعال',
    monthlyPrice: 500000,
    yearlyPrice: 420000,
    icon: ICONS.star,
    gradient: 'from-warning/20 to-warning/5',
    accentColor: 'text-warning',
    bgAccent: 'bg-warning/10',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'سازمانی',
    description: 'برای شرکت‌های بزرگ',
    monthlyPrice: 1500000,
    yearlyPrice: 1200000,
    icon: ICONS.crown,
    gradient: 'from-destructive/20 to-destructive/5',
    accentColor: 'text-destructive',
    bgAccent: 'bg-destructive/10',
  },
];

const FEATURES: PlanFeature[] = [
  { label: 'تعداد آگهی فعال', basic: '۵۰', professional: '۲۰۰', enterprise: 'نامحدود' },
  { label: 'پشتیبانی پیامکی', basic: true, professional: true, enterprise: true },
  { label: 'پشتیبانی تلفنی', basic: false, professional: true, enterprise: true },
  { label: 'آمار بازدید', basic: true, professional: false, enterprise: false },
  { label: 'آمار پیشرفته', basic: false, professional: true, enterprise: true },
  { label: 'ویترین اختصاصی', basic: false, professional: true, enterprise: true },
  { label: 'گزارش‌های تحلیلی', basic: false, professional: false, enterprise: true },
  { label: 'اولویت در نتایج جستجو', basic: false, professional: false, enterprise: true },
  { label: 'API اختصاصی', basic: false, professional: false, enterprise: true },
  { label: 'پشتیبانی ۲۴ ساعته', basic: false, professional: false, enterprise: true },
];

const ADDONS = [
  { id: 'extra_listings', label: '+۵۰ آگهی اضافه', price: 80000, icon: ICONS.zap },
  { id: 'priority_support', label: 'پشتیبانی Priority', price: 120000, icon: ICONS.headset },
  { id: 'analytics_pro', label: 'گزارش‌های پرو', price: 150000, icon: ICONS.chart },
  { id: 'featured_showcase', label: 'ویترین ویژه', price: 200000, icon: ICONS.gem },
];

function formatPrice(amount: number) {
  return amount.toLocaleString('fa-IR');
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Icon d={ICONS.check} className="h-4 w-4 text-success mx-auto" />
    ) : (
      <Icon d={ICONS.x} className="h-4 w-4 text-muted-foreground/40 mx-auto" />
    );
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

export default function PricingPage() {
  const isAuthenticated = useIsAuthenticated();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const buyHref = isAuthenticated ? '/dealer/subscription' : '/login?redirect=/dealer/subscription';

  const plan = PLANS.find((p) => p.id === selectedPlan)!;
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
    <div className="relative min-h-screen text-foreground overflow-x-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[180px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-12 md:pt-20 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-primary rounded-full motion-safe:animate-pulse" />
            تعرفه‌های اشتراک
          </span>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-foreground mb-4">
            طرح مناسب کسب‌وکارتان را انتخاب کنید
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-light max-w-2xl mx-auto leading-relaxed">
            با هر طرح، به ابزارهای حرفه‌ای فروش و بازاریابی دسترسی دارید. بدون هزینه پنهان، هر زمان که خواستید تغییر دهید.
          </p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="flex justify-center mb-12"
        >
          <div className="glass-strong p-1.5 h-12 w-full max-w-sm rounded-2xl flex gap-1">
            {(['monthly', 'yearly'] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={cn(
                  'flex-1 h-full rounded-xl text-sm font-medium relative transition-colors duration-300 flex items-center justify-center gap-2',
                  billingCycle === cycle ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {billingCycle === cycle && (
                  <motion.div
                    layoutId="billing-bg"
                    className="absolute inset-0 bg-surface-1 rounded-xl shadow-sm border border-border-subtle"
                    transition={spring}
                  />
                )}
                <span className="relative z-10">{cycle === 'monthly' ? 'ماهیانه' : 'سالانه'}</span>
                {cycle === 'yearly' && (
                  <span className="relative z-10 bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full border border-success/20">
                    ۱۰٪ تخفیف
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Plan Cards */}
        <LayoutGroup>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {PLANS.map((p, index) => {
              const isSelected = selectedPlan === p.id;
              const price = billingCycle === 'monthly' ? p.monthlyPrice : p.yearlyPrice;
              const period = billingCycle === 'monthly' ? 'ماه' : 'سال';

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.08, duration: 0.4 }}
                  layout
                  onClick={() => setSelectedPlan(p.id)}
                  className={cn(
                    'relative rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden group',
                    isSelected
                      ? 'border-primary/40 shadow-[0_0_30px_-8px_var(--color-primary)] scale-[1.02]'
                      : 'border-border-subtle hover:border-border bg-surface/30 hover:bg-surface/50'
                  )}
                >
                  {/* Gradient overlay */}
                  <div className={cn(
                    'absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 pointer-events-none bg-gradient-to-b',
                    p.gradient,
                    (isSelected || true) && 'opacity-100'
                  )} />

                  {/* Popular badge */}
                  {p.popular && (
                    <div className="absolute -top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-warning to-transparent" />
                  )}

                  <div className="relative p-6 flex flex-col h-full">
                    {p.popular && (
                      <div className="absolute top-4 left-4 bg-warning/10 text-warning text-[10px] font-bold px-2.5 py-1 rounded-full border border-warning/20">
                        محبوب‌ترین
                      </div>
                    )}

                    {/* Icon & Title */}
                    <div className="flex items-center gap-4 mb-5 mt-1">
                      <div className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300',
                        isSelected ? `${p.bgAccent} ${p.accentColor}` : 'bg-surface-2 text-muted-foreground group-hover:bg-surface-3'
                      )}>
                        <Icon d={p.icon} className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={price}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25 }}
                          className="flex items-baseline gap-1"
                        >
                          <span className="text-3xl font-bold text-foreground tracking-tight">
                            {formatPrice(price)}
                          </span>
                          <span className="text-sm text-muted-foreground">تومان / {period}</span>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-border-subtle mb-5" />

                    {/* CTA */}
                    <button
                      className={cn(
                        'w-full py-3 rounded-xl text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'btn-primary shadow-sm'
                          : 'bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground'
                      )}
                    >
                      انتخاب طرح {p.name}
                    </button>

                    {/* Radio indicator */}
                    <div className="absolute top-6 left-6">
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                        isSelected ? 'border-primary' : 'border-border'
                      )}>
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-2.5 h-2.5 rounded-full bg-primary"
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">مقایسه امکانات</h2>
            <p className="text-sm text-muted-foreground">بررسی تفصیلی ویژگی‌های هر طرح</p>
          </div>

          <div className="glass-strong rounded-3xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-4 gap-0 border-b border-border-subtle bg-surface/30">
              <div className="p-4 text-sm font-medium text-muted-foreground">امکانات</div>
              {PLANS.map((p) => (
                <div key={p.id} className={cn(
                  'p-4 text-center text-sm font-bold',
                  p.popular ? 'text-warning' : 'text-foreground'
                )}>
                  {p.name}
                </div>
              ))}
            </div>

            {/* Table Rows */}
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className={cn(
                  'grid grid-cols-4 gap-0 border-b border-border-subtle/50 transition-colors hover:bg-surface/20',
                  i === FEATURES.length - 1 && 'border-b-0'
                )}
              >
                <div className="p-4 text-sm text-foreground/80 flex items-center">{feature.label}</div>
                <div className="p-4 flex items-center justify-center">
                  <FeatureValue value={feature.basic} />
                </div>
                <div className="p-4 flex items-center justify-center bg-primary/[0.02]">
                  <FeatureValue value={feature.professional} />
                </div>
                <div className="p-4 flex items-center justify-center">
                  <FeatureValue value={feature.enterprise} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Addons Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">افزونه‌های اختیاری</h2>
            <p className="text-sm text-muted-foreground">قابلیت‌های اضافی برای ارتقای طرح شما</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADDONS.map((addon, i) => {
              const active = selectedAddons.includes(addon.id);
              return (
                <motion.button
                  key={addon.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + i * 0.06, duration: 0.35 }}
                  onClick={() => toggleAddon(addon.id)}
                  className={cn(
                    'relative p-5 rounded-2xl border text-right transition-all duration-200 group',
                    active
                      ? 'border-primary/40 bg-primary/5 shadow-[0_0_20px_-8px_var(--color-primary)]'
                      : 'border-border-subtle bg-surface/30 hover:bg-surface/50 hover:border-border'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                      active ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-muted-foreground group-hover:text-foreground'
                    )}>
                      <Icon d={addon.icon} className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium transition-colors', active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground')}>
                        {addon.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatPrice(addon.price)} تومان / {billingCycle === 'monthly' ? 'ماه' : 'سال'}
                      </p>
                    </div>
                  </div>

                  {/* Checkbox */}
                  <div className={cn(
                    'absolute top-4 left-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                    active ? 'border-primary bg-primary' : 'border-border'
                  )}>
                    {active && <Icon d={ICONS.check} className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Summary & CTA */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPlan + billingCycle + selectedAddons.join(',')}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="glass-strong rounded-3xl p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">مجموع پرداخت</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={totalPrice}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="text-3xl font-bold text-foreground tracking-tight"
                  >
                    {formatPrice(totalPrice)}
                    <span className="text-base font-normal text-muted-foreground mr-1">تومان</span>
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-muted-foreground mt-2">
                  طرح {plan.name} — {billingCycle === 'monthly' ? 'ماهیانه' : 'سالانه'}
                  {selectedAddons.length > 0 && ` + ${selectedAddons.length} افزونه`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={buyHref}
                  className="btn btn-primary py-3 px-8 rounded-xl text-sm font-medium whitespace-nowrap text-center shadow-sm"
                >
                  {isAuthenticated ? 'خرید اشتراک' : 'ورود و خرید اشتراک'}
                </Link>
                <Link
                  href="/contact"
                  className="btn btn-glass py-3 px-6 rounded-xl text-sm font-medium whitespace-nowrap text-center"
                >
                  مشاوره رایگان
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* FAQ hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-center mt-10"
        >
          <p className="text-sm text-muted-foreground">
            سوالی دارید؟{' '}
            <Link href="/faq" className="text-primary hover:underline font-medium">
              سوالات متداول
            </Link>
            {' '}را مطالعه کنید یا{' '}
            <Link href="/contact" className="text-primary hover:underline font-medium">
              با ما تماس
            </Link>
            {' '}بگیرید.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
