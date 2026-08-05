'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate, useScroll } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { apiGet } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { ContentCard } from '@/components/content/ContentCard';
import { useContents } from '@/hooks/useContents';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Content, Category, Listing } from '@/types';
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
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AnimatedWords } from '@/components/home/AnimatedWords';
import { FEATURES, STEPS, QUICK_LINKS, usePublicStats } from '@/components/home/homeData';

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

  const SectionDivider = (
    <div className="relative z-10 py-12 flex items-center justify-center" aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
      </div>
      <div className="relative flex items-center gap-3">
        <div className="w-20 sm:w-32 h-px bg-gradient-to-l from-border/40 via-border/20 to-transparent" />
        <div className="relative flex items-center justify-center">
          <div className="absolute w-5 h-5 rounded-full border border-primary/20 bg-primary/[0.04]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        </div>
        <div className="w-20 sm:w-32 h-px bg-gradient-to-r from-border/40 via-border/20 to-transparent" />
      </div>
    </div>
  );

  const [quickOpen, setQuickOpen] = useState(false);
  const quickOpenRef = useRef(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [showAllTrigger, setShowAllTrigger] = useState(0);
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

  const { data: allContent, isLoading: artLoading, isError: artError } = useContents();
  const homeArticles = (allContent ?? []).filter(c => c.contentType.slug === 'news');
  const homeGuides = (allContent ?? []).filter(c => ['guide', 'how_to', 'maintenance', 'glossary', 'tech_spec', 'buying_guide'].includes(c.contentType.slug));

  return (
    <>
      {!disableEffects && <CustomCursor />}

      <div className="min-h-screen text-foreground selection:bg-primary/20 selection:text-foreground overflow-x-hidden relative flex flex-col">

      {/* scroll progress */}
      <motion.div style={{ scaleX }} className="fixed top-0 inset-x-0 h-[3px] bg-gradient-to-l from-primary via-primary/80 to-primary origin-right z-50 shadow-[0_0_12px_var(--color-primary)]" />

      {/* cursor glow — only on desktop */}
      {!disableEffects && <motion.div className="fixed inset-0 z-0 pointer-events-none" style={{ background: glowBg }} />}

      {/* شوتینگ استار - فقط موبایل */}
      <div className="md:hidden fixed inset-0 z-[15] pointer-events-none overflow-hidden" style={{ '--star-color': 'var(--color-primary)' } as React.CSSProperties}>
        <ShootingStars starColor="var(--star-color)" trailColor="var(--star-color)" minSpeed={3} maxSpeed={9} minDelay={4000} maxDelay={9000} starWidth={120} starHeight={2} />
        <ShootingStars starColor="var(--star-color)" trailColor="var(--star-color)" minSpeed={5} maxSpeed={12} minDelay={6000} maxDelay={12000} starWidth={90} starHeight={1.5} />
        <ShootingStars starColor="var(--star-color)" trailColor="var(--star-color)" minSpeed={4} maxSpeed={10} minDelay={3000} maxDelay={15000} starWidth={140} starHeight={2.5} />
      </div>

      {/* interactive particles — فقط دسکتاپ */}
      {!disableEffects && <ParticleBackground className="fixed inset-0 z-[1] w-full h-full" />}

      {/* ===== 1. HERO ===== */}
      <section ref={heroRef} className="relative z-10 min-h-[88vh] flex flex-col items-center justify-center pt-10 pb-24 px-4">

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

      {SectionDivider}

      {/* ===== 3. CATEGORIES ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <SectionHeader eyebrow="Quick Access" title="دسته‌بندی‌های اصلی" cta={{ label: 'مشاهده تمام دسته‌ها', onClick: () => setShowAllTrigger(prev => prev + 1) }} />
        <CategoryGrid categories={categories} catLoading={catLoading} catError={catError} showAllTrigger={showAllTrigger} />
      </section>

      {/* ===== 4. TUNING CATALOG ENTRY ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-10 w-full">
        <SlideUp rootMargin="-40px">
          <Link href="/catalog/tuning" className="group block">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/30 to-surface-2/30 hover:border-primary/30 transition-colors duration-300">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 p-6 md:p-8">
                <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_-8px_var(--color-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      قطعات تیونینگ
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 leading-relaxed">
                      ارتقای عملکرد خودرو و موتورسیکلت؛ پیستون، اگزوز اسپرت، ریمپ ECU، زیربندی و بدنه
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-xs md:text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                    ورود به کاتالوگ تیونینگ
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4 text-primary transition-transform duration-300 group-hover:-translate-x-1">
                    <path d="M13 15l-5-5 5-5" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </SlideUp>
      </section>

      {/* ===== 4a. ACCESSORY CATALOG ENTRY ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-10 w-full">
        <SlideUp rootMargin="-40px">
          <Link href="/catalog/accessory" className="group block">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/30 to-surface-2/30 hover:border-primary/30 transition-colors duration-300">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 p-6 md:p-8">
                <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_-8px_var(--color-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3L12 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      اکسسوری و تزئینات خودرو
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 leading-relaxed">
                      دکوراسیون داخلی، نورپردازی، محافظت بدنه و لوازم جانبی موتورسیکلت
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-xs md:text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                    ورود به کاتالوگ اکسسوری
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4 text-primary transition-transform duration-300 group-hover:-translate-x-1">
                    <path d="M13 15l-5-5 5-5" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </SlideUp>
      </section>

      {/* ===== 4b. PARTS CATALOG ENTRY ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-10 w-full">
        <SlideUp rootMargin="-40px">
          <Link href="/parts" className="group block">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/30 to-surface-2/30 hover:border-primary/30 transition-colors duration-300">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 p-6 md:p-8">
                <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_-8px_var(--color-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      قطعات یدکی و ادوات
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 leading-relaxed">
                      جستجوی قطعات اصلی، تأمینی، ادوات و مصرفی خودروها و ماشین‌آلات
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-xs md:text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                    ورود به فروشگاه قطعات
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4 text-primary transition-transform duration-300 group-hover:-translate-x-1">
                    <path d="M13 15l-5-5 5-5" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </SlideUp>
      </section>

      {/* ===== 4c. WORKSHOPS ENTRY ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-10 w-full">
        <SlideUp rootMargin="-40px">
          <Link href="/workshops" className="group block">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/30 to-surface-2/30 hover:border-primary/30 transition-colors duration-300">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 p-6 md:p-8">
                <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_-8px_var(--color-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <path d="M12 15l3.5-3.5M20.3 18a10 10 0 10-16.6 0" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      تعمیرکاران و تیونرها
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 leading-relaxed">
                      معرفی تعمیرگاه‌ها و تیونرهای معتبر با آدرس، تخصص و خدمات
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-xs md:text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                    مشاهده تعمیرکاران
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4 text-primary transition-transform duration-300 group-hover:-translate-x-1">
                    <path d="M13 15l-5-5 5-5" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </SlideUp>
      </section>

      {/* ===== 4b. INSURANCE SECTION ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-10 w-full">
        <SlideUp rootMargin="-40px">
          <Link href="/insurance" className="group block">
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface/30 to-surface-2/30 hover:border-primary/30 transition-colors duration-300">
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-accent/[0.04] rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 p-6 md:p-8">
                <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/25 flex items-center justify-center text-primary shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_30px_-8px_var(--color-primary)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      بیمه خودرو و ماشین‌آلات
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 leading-relaxed">
                      مقایسه و خرید آنلاین بیمه شخص ثالث، بدنه، موتور و ماشین‌آلات از معتبرترین شرکت‌های بیمه
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <span className="text-xs md:text-sm font-medium text-primary/80 group-hover:text-primary transition-colors">
                    خرید بیمه
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4 text-primary transition-transform duration-300 group-hover:-translate-x-1">
                    <path d="M13 15l-5-5 5-5" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </SlideUp>
      </section>

      {SectionDivider}

      {/* ===== 5. LATEST LISTINGS ===== */}
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
          <SlideUp rootMargin="-60px" className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none z-[2]" />
            <div
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
              }}
              className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 h-full overflow-hidden group hover:shadow-[0_0_50px_-16px_var(--color-primary)] transition-shadow duration-500"
            >
              {/* spotlight */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
                style={{ background: 'radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 60%)' }}
              />
              {/* noise texture */}
              <div className="absolute inset-0 opacity-[0.01] pointer-events-none rounded-3xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
              <ListingGrid listings={latest} />
            </div>
          </SlideUp>
        )}
      </section>

      {SectionDivider}

      {/* ===== 6. CONTENT ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        {/* ambient glows */}
        <div className="absolute top-32 -right-40 w-96 h-96 bg-primary/[0.04] rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-24 -left-40 w-80 h-80 bg-emerald-500/[0.03] rounded-full blur-[110px] pointer-events-none" />

        <div className="relative z-10">
          <SectionHeader
            eyebrow="Knowledge Base"
            title="دانشنامه و اخبار بازار"
          />

          {artLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : artError ? (
            <div className="col-span-4 text-center py-12">
              <p className="text-sm text-muted-foreground">خطا در بارگذاری مقالات</p>
            </div>
          ) : homeArticles.length === 0 && homeGuides.length === 0 ? (
            <div className="col-span-4">
              <EmptyState title="موردی یافت نشد" description="در حال حاضر مقاله‌ای منتشر نشده است." icon="default" />
            </div>
          ) : (
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
              {/* vertical gradient divider */}
              <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-primary/30 to-transparent pointer-events-none" aria-hidden />
              {homeArticles.length > 0 && (
                <div>
                  <Link href="/news" className="group inline-flex items-center gap-2.5 px-4 py-2 mb-5 rounded-xl border font-bold text-foreground text-sm transition-all duration-300" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 15%, transparent)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 6%, transparent)'; }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                    آخرین اخبار
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 animate-arrow-nudge" style={{ color: 'var(--color-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </Link>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {homeArticles.slice(0, 2).map((article, i) => (
                      <SlideUp key={article.id} delay={i * 0.08} rootMargin="-40px">
                        <ContentCard content={article} accent="var(--color-primary)" />
                      </SlideUp>
                    ))}
                  </div>
                </div>
              )}
              {homeGuides.length > 0 && (
                <div>
                  <Link href="/encyclopedia" className="group inline-flex items-center gap-2.5 px-4 py-2 mb-5 rounded-xl border font-bold text-foreground text-sm transition-all duration-300" style={{ borderColor: 'color-mix(in srgb, var(--color-primary) 25%, transparent)', backgroundColor: 'color-mix(in srgb, var(--color-primary) 6%, transparent)' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 15%, transparent)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 6%, transparent)'; }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                    دانشنامه
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 animate-arrow-nudge" style={{ color: 'var(--color-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </Link>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {homeGuides.slice(0, 2).map((guide, i) => (
                      <SlideUp key={guide.id} delay={i * 0.08} rootMargin="-40px">
                        <ContentCard content={guide} accent="var(--color-primary)" />
                      </SlideUp>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {SectionDivider}

      {/* ===== 7. HOW IT WORKS ===== */}
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

      {/* ===== 8. BENTO FEATURES ===== */}
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
              className={feature.size}
            >
            <div
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
              }}
              className="group relative bg-gradient-to-br from-card to-surface/30 border border-border rounded-2xl p-8 hover:border-primary/40 transition-all duration-500 overflow-hidden h-full hover:shadow-[0_0_50px_-16px_var(--color-primary)] hover:-translate-y-0.5"
            >
              {/* mouse spotlight */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
                style={{ background: 'radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%)' }}
              />
              {/* shimmer sweep on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(110deg, transparent, color-mix(in srgb, var(--color-primary) 4%, transparent), transparent)', backgroundSize: '200% 100%' }} />
              </div>
              {/* noise texture */}
              <div className="absolute inset-0 opacity-[0.012] pointer-events-none rounded-2xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
              <span className="absolute top-6 left-6 text-5xl font-black text-foreground/[0.04] group-hover:text-primary/10 transition-colors select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-[0_0_20px_-6px_var(--color-primary)]">
                  <Icon d={feature.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            </SlideUp>
          ))}
        </div>
      </section>

      {/* ===== 9. STATS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <SlideUp rootMargin="-60px" className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent pointer-events-none z-[2]" />
          <div
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
            className="border border-border rounded-3xl bg-surface/20 backdrop-blur-sm overflow-hidden group hover:shadow-[0_0_50px_-16px_var(--color-primary)] transition-shadow duration-500"
          >
            {/* spotlight */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
              style={{ background: 'radial-gradient(700px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 60%)' }}
            />
            {/* noise texture */}
            <div className="absolute inset-0 opacity-[0.01] pointer-events-none rounded-3xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 divide-x divide-x-reverse divide-border">
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
          </div>
        </SlideUp>
      </section>

      {SectionDivider}

      {/* ===== 10. CTA ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <ScaleIn rootMargin="-60px">
          <div
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
              e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
            }}
            className="relative bg-gradient-to-br from-card via-primary/[0.06] to-card border border-border rounded-3xl p-12 md:p-20 overflow-hidden text-center group hover:border-primary/30 transition-colors duration-500 hover:shadow-[0_0_60px_-20px_var(--color-primary)]"
          >
            {/* spotlight */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
              style={{ background: 'radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--color-primary) 12%, transparent), transparent 60%)' }}
            />
            {/* noise texture */}
            <div className="absolute inset-0 opacity-[0.012] pointer-events-none rounded-3xl" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
            {/* animated glow orb */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/15 rounded-full blur-[120px]"
            />
            {/* shimmer sweep */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute inset-0 animate-shimmer" style={{ background: 'linear-gradient(110deg, transparent, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent)', backgroundSize: '200% 100%' }} />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="mb-6 inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs text-muted-foreground border border-border/60">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                آماده شروع هستی؟
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
                <span className="text-gradient">آینده معامله ماشین‌آلات،</span>
                <br />
                همین حالا آغاز شد.
              </h2>
              <p className="text-muted-foreground mb-10 leading-relaxed max-w-lg mx-auto">به شبکه‌ای از حرفه‌ای‌ترین خریداران و فروشندگان ایران بپیوندید و تجربه‌ای متفاوت از امنیت و سرعت داشته باشید.</p>
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
