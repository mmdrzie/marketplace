'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate, useScroll } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { apiGet } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { NewsCard } from '@/components/news/NewsCard';
import { useArticles } from '@/hooks/useArticles';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Article, Category, Listing } from '@/types';
import { ICON_PATHS } from '@/lib/icons';
import { throttle } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { SkeletonCard, SkeletonListings } from '@/components/common/Skeleton';
import { SlideUp, ScaleIn } from '@/components/common/MotionDiv.client';
import { FocusTrap } from '@/components/common/FocusTrap';
import { EmptyState } from '@/components/common/EmptyState';
import { Typewriter } from '@/components/home/Typewriter';
import { CountUp } from '@/components/home/CountUp';
import { MagneticButton } from '@/components/home/MagneticButton';
import { TiltSpotlightCard } from '@/components/home/TiltSpotlightCard';
import { SectionHeader } from '@/components/home/SectionHeader';
import { CardSkeleton } from '@/components/home/CardSkeleton';
import { AnimatedWords } from '@/components/home/AnimatedWords';
import { FEATURES, STEPS, QUICK_LINKS, MARKET_TICKER, usePublicStats } from '@/components/home/homeData';

const CustomCursor = dynamic(() => import('@/components/common/CustomCursor').then(mod => mod.CustomCursor), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/common/ParticleBackground').then(mod => mod.ParticleBackground), { ssr: false });
const ShootingStars = dynamic(() => import('@/components/ui/shooting-stars').then(mod => ({ default: mod.ShootingStars })), { ssr: false });

const Icon = ({ d, className = 'w-5 h-5' }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => !!s.token);
  const { data: statsData } = usePublicStats();
  const STATS = [
    { value: statsData?.activeListings ?? 0, suffix: '+', label: 'آگهی فعال', icon: ICON_PATHS.doc },
    { value: statsData?.approvedDealers ?? 0, suffix: '+', label: 'نماینده رسمی', icon: ICON_PATHS.grid },
    { value: statsData?.totalProvinces ?? 0, suffix: '', label: 'استان تحت پوشش', icon: ICON_PATHS.chart },
    { value: 98, suffix: '%', label: 'رضایت کاربران', icon: ICON_PATHS.star },
  ];
  const [quickOpen, setQuickOpen] = useState(false);
  const quickOpenRef = useRef(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [showTop, setShowTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => { setMounted(true); }, []);

  const disableEffects = !mounted ? false : (isTouch || reducedMotion);

  /* progress bar */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  /* cursor glow — useMotionValue avoids React re-render cycle */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowBg = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 80%)`;

  useEffect(() => {
    const onScroll = throttle(() => {
      setShowTop(window.scrollY > 800);
    }, 100);
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!disableEffects) {
      const onMove = (e: MouseEvent) => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      };
      window.addEventListener('mousemove', onMove, { passive: true });
      return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMove); };
    }
    return () => window.removeEventListener('scroll', onScroll);
  }, [disableEffects]);

  /* sync ref with state */
  useEffect(() => { quickOpenRef.current = quickOpen; });

  /* keyboard — single listener registration via empty deps */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!quickOpenRef.current) {
          setQuickQuery('');
          setTimeout(() => searchInputRef.current?.focus(), 80);
        }
        setQuickOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filteredLinks = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return QUICK_LINKS;
    return QUICK_LINKS.filter((l) => l.label.includes(q) || l.keywords.toLowerCase().includes(q));
  }, [quickQuery]);

  /* data */
  const { data: apiCategories, isLoading: catLoading, isError: catError } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: () => apiGet<Category[]>('/categories'),
    staleTime: 300000,
  });
  const categories = apiCategories ?? [];

  const { data: latest, isLoading: listLoading, isError: listError } = useQuery({
    queryKey: queryKeys.listings.latest,
    queryFn: () => apiGet<Listing[]>('/listings', { params: { sort: 'newest', per_page: 8 } }),
  });

  const { data: apiArticles, isLoading: artLoading, isError: artError } = useArticles();
  const homeArticles = apiArticles ?? [];

  return (
    <>
      {!disableEffects && <CustomCursor />}

      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground overflow-x-hidden relative flex flex-col">

      {/* scroll progress */}
      <motion.div style={{ scaleX }} className="fixed top-0 inset-x-0 h-[3px] bg-gradient-to-l from-primary via-primary/80 to-primary origin-right z-50 shadow-[0_0_12px_var(--color-primary)]" />

      {/* cursor glow — only on desktop */}
      {!disableEffects && <motion.div className="fixed inset-0 z-0 pointer-events-none" style={{ background: glowBg }} />}

      {/* grid pattern with radial mask */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.04] text-foreground"
        style={{
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 60%, transparent 100%)',
        }}
      />

      {/* شوتینگ استار - فقط موبایل */}
      <div className="md:hidden fixed inset-0 z-[15] pointer-events-none overflow-hidden" style={{ '--star-color': 'var(--color-primary)' } as React.CSSProperties}>
        <ShootingStars starColor="var(--star-color)" trailColor="var(--star-color)" minSpeed={3} maxSpeed={9} minDelay={4000} maxDelay={9000} starWidth={120} starHeight={2} />
        <ShootingStars starColor="var(--star-color)" trailColor="var(--star-color)" minSpeed={5} maxSpeed={12} minDelay={6000} maxDelay={12000} starWidth={90} starHeight={1.5} />
        <ShootingStars starColor="var(--star-color)" trailColor="var(--star-color)" minSpeed={4} maxSpeed={10} minDelay={3000} maxDelay={15000} starWidth={140} starHeight={2.5} />
      </div>

      {/* interactive particles — فقط دسکتاپ */}
      {!disableEffects && <ParticleBackground className="fixed inset-0 z-[1] w-full h-full" />}

      {/* ===== 1. HERO ===== */}
      <section ref={heroRef} className="relative z-10 min-h-[88vh] flex flex-col items-center justify-center pt-24 pb-24 px-4">
        {/* aurora blobs */}
        {!disableEffects && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-[15%] right-[15%] w-[480px] h-[480px] rounded-full bg-primary/12 blur-[120px]" style={{ animation: 'aurora-1 22s ease-in-out infinite' }} />
          <div className="absolute bottom-[-15%] left-[10%] w-[420px] h-[420px] rounded-full bg-primary/10 blur-[120px]" style={{ animation: 'aurora-2 26s ease-in-out infinite' }} />
        </div>
        )}

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-8 border border-border/60 hover:border-primary/30 transition-colors">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
              </span>
              نسل جدید پلتفرم‌های معامله خودرو و ماشین‌آلات
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter mb-6 leading-[1.05]">
            <AnimatedWords text="بازارگاه مدرن" className="text-gradient" />
            <br />
            <span className="animate-fade-in block md:inline max-w-full" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
              <Typewriter words={['خرید و فروش امن', 'مشاور خرید هوشمند', 'مقایسه فنی خودروها', 'برآورد قیمت لحظه‌ای', 'آگهی‌های تضمین شده', 'جستجوی پیشرفته']} />
            </span>
          </h1>

          <p className="animate-fade-in-up text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            خرید، فروش و اجاره انواع خودرو سواری، ماشین‌آلات سنگین، راهسازی و کشاورزی با بالاترین استانداردهای امنیتی و کاربری.
          </p>

          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center items-center" style={{ animationDelay: '0.55s', animationFillMode: 'both' }}>
            <MagneticButton href="/dashboard/listings/new" variant="primary">
              <Icon d={ICON_PATHS.plus} className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" />
              ثبت آگهی رایگان
            </MagneticButton>
            <MagneticButton href="/search" variant="glass">
              <Icon d={ICON_PATHS.search} className="w-4 h-4" />
              کاوش در بازار
            </MagneticButton>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/listings" className="btn btn-primary btn-sm">
                <Icon d={ICON_PATHS.grid} className="w-4 h-4" /> همه آگهی‌ها
              </Link>
              {!isAuthenticated && (
                <Link href="/login" className="btn btn-glass btn-sm">
                  <Icon d={ICON_PATHS.user} className="w-4 h-4" /> ورود / ثبت‌نام
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* scroll hint */}
        <div className="animate-fade-in absolute bottom-8 left-1/2 -translate-x-1/2" style={{ animationDelay: '1.4s', animationFillMode: 'both' }}>
          <div className="w-6 h-10 rounded-full border-2 border-border flex items-start justify-center p-1.5" style={{ animation: 'scrollHint 1.8s ease-in-out infinite' }}>
            <div className="w-1 h-2 rounded-full bg-primary" />
          </div>
        </div>
      </section>

      {/* ===== 2. TICKER ===== */}
      <div className="group/ticker relative z-20 border-y border-border bg-surface/30 backdrop-blur-sm py-3 overflow-hidden"
        style={{ maskImage: 'linear-gradient(to left, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to left, transparent, black 8%, black 92%, transparent)' }}
      >
        <div className="flex gap-12 animate-marquee-rtl whitespace-nowrap group-hover/ticker:[animation-play-state:paused]">
          {[...MARKET_TICKER, ...MARKET_TICKER].map((trade, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${trade.type === 'فروش' ? 'bg-success/10 text-success' : trade.type === 'خرید' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                {trade.type}
              </span>
              <span className="font-medium text-foreground">{trade.item}</span>
              <span className="text-muted-foreground/70">در {trade.location}</span>
              <span className="text-muted-foreground">• قیمت: {trade.price}</span>
              <span className="text-primary mx-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 inline-block" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== 3. CATEGORIES ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <SectionHeader eyebrow="Quick Access" title="دسته‌بندی‌های اصلی" cta={{ href: '/categories', label: 'مشاهده تمام دسته‌ها' }} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {catLoading
            ? Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)
            : catError ? (
              <div className="col-span-4 text-center py-12">
                <p className="text-sm text-muted-foreground">خطا در بارگذاری دسته‌بندی‌ها</p>
              </div>
            ) : (categories as Category[])?.slice(0, 8).map((cat, i) => (
              <SlideUp key={cat.id} delay={i * 0.05} rootMargin="-40px" className="h-full">
                <TiltSpotlightCard href={`/categories/${cat.slug}`}>
                  <div className="relative z-10 w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_-6px_var(--color-primary)] transition-all duration-300">
                    <Icon d={ICON_PATHS[cat.slug as keyof typeof ICON_PATHS] || ICON_PATHS.default} className="w-6 h-6" />
                  </div>
                  <h3 className="relative z-10 font-medium text-foreground group-hover:text-primary transition-colors mb-2">{cat.name}</h3>
                  {cat.children && cat.children.length > 0 && (
                    <div className="relative z-10 flex items-center text-xs text-muted-foreground bg-surface-2 px-2 py-1 rounded-full border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                      {cat.children.length} زیردسته
                    </div>
                  )}
                </TiltSpotlightCard>
              </SlideUp>
            ))}
        </div>
      </section>

      {/* ===== 4. LATEST LISTINGS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <SectionHeader eyebrow="Real-Time Market" title="جدیدترین آگهی‌ها" cta={{ href: '/listings', label: 'مشاهده همه' }} />
        {listLoading ? (
          <SkeletonListings count={8} />
        ) : listError ? (
          <SlideUp rootMargin="-60px" className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
            <EmptyState title="خطا در بارگذاری" description="امکان دریافت آگهی‌ها وجود ندارد. لطفاً بعداً تلاش کنید." icon="listing" />
          </SlideUp>
        ) : !latest || latest.length === 0 ? (
          <SlideUp rootMargin="-60px" className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
            <EmptyState title="آگهی‌ای یافت نشد" description="هنوز آگهی برای نمایش وجود ندارد." icon="listing" />
          </SlideUp>
        ) : (
          <SlideUp rootMargin="-60px" className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <ListingGrid listings={latest} />
          </SlideUp>
        )}
      </section>

      {/* ===== 5. HOW IT WORKS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-xs text-primary uppercase tracking-[0.2em] font-medium mb-3">
            <span className="w-6 h-px bg-primary/50" /> How It Works <span className="w-6 h-px bg-primary/50" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">فقط در ۳ مرحله ساده</h2>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          <div className="hidden md:block absolute top-8 right-[16%] left-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" aria-hidden />
          {STEPS.map((step, i) => (
            <SlideUp
              key={step.title}
              delay={i * 0.15}
              rootMargin="-60px"
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center text-primary mb-5 shadow-[0_0_25px_-10px_var(--color-primary)]">
                <Icon d={step.icon} className="w-7 h-7" />
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {(i + 1).toLocaleString('fa-IR')}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[260px]">{step.desc}</p>
            </SlideUp>
          ))}
        </div>
      </section>

      {/* ===== 6. ARTICLES ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <SectionHeader eyebrow="Knowledge Base" title="دانشنامه و اخبار بازار" cta={{ href: '/news', label: 'همه مقالات' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {artLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : artError ? (
              <div className="col-span-4 text-center py-12">
                <p className="text-sm text-muted-foreground">خطا در بارگذاری مقالات</p>
              </div>
            ) : homeArticles.length === 0 ? (
              <div className="col-span-4">
                <EmptyState title="موردی یافت نشد" description="در حال حاضر مقاله‌ای منتشر نشده است." icon="default" />
              </div>
            ) : (homeArticles as Article[])?.slice(0, 4).map((article, i) => (
              <SlideUp key={article.id} delay={i * 0.08} rootMargin="-40px">
                <NewsCard article={article} />
              </SlideUp>
            ))}
        </div>
      </section>

      {/* ===== 7. BENTO FEATURES ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs text-primary uppercase tracking-[0.2em] font-medium mb-3">
            <span className="w-6 h-px bg-primary/50" /> Why Choose Us <span className="w-6 h-px bg-primary/50" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">مزیت‌های رقابتی پلتفرم ما</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          {FEATURES.map((feature, i) => (
            <SlideUp
              key={feature.title}
              delay={i * 0.1}
              rootMargin="-40px"
              className={`group relative bg-gradient-to-br from-card to-surface/30 border border-border rounded-2xl p-8 hover:border-primary/40 transition-all duration-300 overflow-hidden ${feature.size}`}
            >
              <span className="absolute top-6 left-6 text-5xl font-black text-foreground/[0.04] group-hover:text-primary/10 transition-colors select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--color-primary)_8%,transparent),transparent_60%)]" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-[0_0_20px_-6px_var(--color-primary)]">
                  <Icon d={feature.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </SlideUp>
          ))}
        </div>
      </section>

      {/* ===== 8. STATS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <SlideUp rootMargin="-60px" className="relative border border-border rounded-3xl bg-surface/20 backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-border">
            {STATS.map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center text-center p-8 md:p-10 hover:bg-surface/40 transition-colors">
                <Icon d={stat.icon} className="w-6 h-6 text-primary mb-3" />
                <span className="text-3xl md:text-4xl font-bold text-foreground tracking-tighter mb-1">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </SlideUp>
      </section>

      {/* ===== 9. CTA ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <ScaleIn rootMargin="-60px" className="relative bg-gradient-to-r from-card via-primary/10 to-card border border-border rounded-3xl p-12 md:p-20 overflow-hidden text-center">
          <div className="absolute inset-0 opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px]"
          />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">آینده معامله ماشین‌آلات، همین حالا آغاز شد.</h2>
            <p className="text-muted-foreground mb-10 leading-relaxed">به شبکه‌ای از حرفه‌ای‌ترین خریداران و فروشندگان ایران بپیوندید و تجربه‌ای متفاوت از امنیت و سرعت داشته باشید.</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <MagneticButton href="/dashboard/listings/new" variant="primary">
                شروع کنید <Icon d={ICON_PATHS.arrow} className="w-4 h-4 rotate-180" />
              </MagneticButton>
              <MagneticButton href="/listings" variant="glass">
                مرور آگهی‌ها
              </MagneticButton>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {['ثبت آگهی رایگان', 'تأیید کارشناسی', 'پشتیبانی ۲۴/۷'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <Icon d={ICON_PATHS.check} className="w-3.5 h-3.5 text-success" /> {t}
                </span>
              ))}
            </div>
          </div>
        </ScaleIn>
      </section>

      {/* ===== BACK TO TOP ===== */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 left-6 z-50 w-11 h-11 rounded-xl bg-surface border border-border text-foreground flex items-center justify-center hover:border-primary/50 hover:text-primary shadow-lg backdrop-blur-md transition-all duration-200"
        style={{ opacity: showTop ? 1 : 0, pointerEvents: showTop ? 'auto' : 'none', transform: showTop ? 'scale(1)' : 'scale(0.8) translateY(10px)' }}
        aria-label="بازگشت به بالا"
      >
        <Icon d={ICON_PATHS.chevronUp} className="w-5 h-5" />
      </button>

      {/* ===== COMMAND PALETTE ===== */}
      <FocusTrap active={quickOpen}>
      <div className={`fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4 transition-all duration-300 ease-out ${
        quickOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="fixed inset-0 bg-overlay backdrop-blur-sm transition-opacity duration-300" onClick={() => setQuickOpen(false)} />
        <div className={`relative z-10 w-full max-w-2xl bg-surface-1/90 border border-border/50 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden transition-all duration-300 ease-out ${
          quickOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
        }`} role="dialog" aria-modal="true">
            <div className="p-4 border-b border-border/30 flex items-center gap-3 bg-surface-2/40">
              <Icon d={ICON_PATHS.search} className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={searchInputRef}
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="جستجو در ابزارها و صفحات..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button onClick={() => setQuickOpen(false)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-3 transition-colors text-muted-foreground" aria-label="بستن">
                <Icon d={ICON_PATHS.close} className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[50vh] overflow-y-auto">
              {filteredLinks.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {filteredLinks.map((link, i) => (
                    <div
                      key={link.href}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${i * 30}ms`, animationFillMode: 'both' }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setQuickOpen(false)}
                        className="group flex flex-col items-start gap-3 p-4 rounded-xl border border-border/30 hover:border-primary/30 bg-surface-2/30 hover:bg-primary/5 transition-all h-full"
                      >
                        <div className="w-9 h-9 rounded-lg bg-surface-2 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                          <Icon d={link.icon} className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{link.label}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  نتیجه‌ای برای «{quickQuery}» یافت نشد.
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-border/30 bg-surface-2/20 text-xs text-muted-foreground flex justify-between items-center">
              <span className="flex items-center gap-2">
                <kbd className="bg-surface-2 border border-border rounded px-1.5 py-0.5 font-sans">ESC</kbd> برای بستن
              </span>
              <span>پلتفرم تخصصی بازارگاه</span>
            </div>
          </div>
        </div>
      </FocusTrap>
      </div>
    </>
  );
}
