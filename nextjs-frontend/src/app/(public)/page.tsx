'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useMotionTemplate, useScroll } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { NewsCard } from '@/components/news/NewsCard';
import { useArticles } from '@/hooks/useArticles';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Article, Category } from '@/types';
import { throttle } from '@/lib/utils';
import { ICON_PATHS } from '@/lib/icons';
import dynamic from 'next/dynamic';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonListings } from '@/components/common/Skeleton';
import { SlideUp, ScaleIn } from '@/components/common/MotionDiv.client';
const CustomCursor = dynamic(() => import('@/components/common/CustomCursor').then(mod => mod.CustomCursor), { ssr: false });
const ParticleBackground = dynamic(() => import('@/components/common/ParticleBackground').then(mod => mod.ParticleBackground), { ssr: false });

/* ============ Icons ============ */
const Icon = ({ d, className = 'w-5 h-5' }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

// ICON_PATHS are now imported from '@/lib/icons'

/* ============ Data ============ */
const STATS = [
  { value: 12500, suffix: '+', label: 'آگهی فعال', icon: ICON_PATHS.doc },
  { value: 850, suffix: '+', label: 'نماینده رسمی', icon: ICON_PATHS.grid },
  { value: 31, suffix: '', label: 'استان تحت پوشش', icon: ICON_PATHS.chart },
  { value: 98, suffix: '%', label: 'رضایت کاربران', icon: ICON_PATHS.star },
];

const FEATURES = [
  { icon: ICON_PATHS.shield, title: 'تضمین اصالت آگهی', desc: 'تمام آگهی‌ها پیش از انتشار توسط کارشناسان ما بررسی می‌شوند تا معامله‌ای امن داشته باشید.', size: 'md:col-span-2' },
  { icon: ICON_PATHS.search, title: 'موتور جستجوی هوشمند', desc: 'فیلترهای پیشرفته برای دسترسی سریع به دقیق‌ترین نتایج.', size: 'md:col-span-1' },
  { icon: ICON_PATHS.bolt, title: 'ارتباط مستقیم و امن', desc: 'سیستم پیام‌رسان داخلی برای مذاکره بدون نیاز به اشتراک شماره تماس.', size: 'md:col-span-1' },
  { icon: ICON_PATHS.chart, title: 'نمایش ویژه (VIP)', desc: 'با ارتقا آگهی، در صدر نتایج جستجو قرار بگیرید و سرعت فروش خود را چند برابر کنید.', size: 'md:col-span-2' },
];

const STEPS = [
  { icon: ICON_PATHS.user, title: 'ثبت‌نام سریع', desc: 'در کمتر از یک دقیقه حساب کاربری خود را بسازید و وارد بازار شوید.' },
  { icon: ICON_PATHS.camera, title: 'ثبت آگهی حرفه‌ای', desc: 'تصاویر و مشخصات فنی را وارد کنید؛ کارشناسان ما آگهی را تأیید می‌کنند.' },
  { icon: ICON_PATHS.message, title: 'معامله امن', desc: 'با خریداران واقعی از طریق پیام‌رسان داخلی مذاکره و معامله کنید.' },
];

const QUICK_LINKS = [
  { href: '/news', label: 'اخبار بازار', icon: ICON_PATHS.doc, keywords: 'news اخبار مقاله' },
  { href: '/market-pulse', label: 'نبض بازار', icon: ICON_PATHS.chart, keywords: 'pulse نبض قیمت' },
  { href: '/price-estimator', label: 'برآورد قیمت', icon: ICON_PATHS.search, keywords: 'price قیمت برآورد' },
  { href: '/car-matchmaker', label: 'مشاور خرید', icon: ICON_PATHS.star, keywords: 'مشاور خرید پیشنهاد' },
  { href: '/car-vs-car', label: 'مقایسه فنی', icon: ICON_PATHS.compare, keywords: 'مقایسه فنی خودرو' },
  { href: '/compare', label: 'مقایسه آگهی‌ها', icon: ICON_PATHS.grid, keywords: 'مقایسه آگهی' },
  { href: '/imported', label: 'خودروهای وارداتی', icon: ICON_PATHS.chart, keywords: 'وارداتی خارجی imported customs' },
  { href: '/imported/customs-calc', label: 'محاسبه هزینه واردات', icon: ICON_PATHS.search, keywords: 'customs گمرک تعرفه واردات' },
  { href: '/parts', label: 'قطعات یدکی', icon: ICON_PATHS.search, keywords: 'قطعات یدکی ادوات parts' },
  { href: '/search', label: 'جستجوی پیشرفته', icon: ICON_PATHS.search, keywords: 'جستجو search فیلتر' },
  { href: '/dashboard/listings/new', label: 'ثبت آگهی', icon: ICON_PATHS.plus, keywords: 'ثبت آگهی فروش' },
];

const MARKET_TICKER = [
  { type: 'فروش', item: 'بیل مکانیکی کوماتسو PC200', location: 'تهران', price: '۸.۵ میلیارد' },
  { type: 'خرید', item: 'کامیون فول ۳۵۰', location: 'اصفهان', price: '۳.۲ میلیارد' },
  { type: 'فروش', item: 'گریدر کوماتسو GD405', location: 'خراسان رضوی', price: '۱۲ میلیارد' },
  { type: 'اجاره', item: 'بیل بک کاترپیلار 320', location: 'خوزستان', price: 'روزانه ۸ میلیون' },
  { type: 'فروش', item: 'لودر ولوو DL420', location: 'البرز', price: '۹.۸ میلیارد' },
];

/* ============ Helpers ============ */

const CountUp = ({ value, suffix }: { value: number; suffix: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame: number;
    let start: number | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const duration = 2200;
      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - (1 - t) * (1 - t) * (1 - t);
        setDisplay(Math.floor(ease * value));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      observer.disconnect();
    }, { rootMargin: '-40px' });
    observer.observe(el);
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [value]);

  return <span ref={ref}>{display.toLocaleString('fa-IR')}{suffix}</span>;
};

const MagneticButton = ({ children, href, variant = 'glass' }: { children: React.ReactNode; href: string; variant?: 'primary' | 'glass' }) => {
  return (
    <div className="inline-block active:scale-[0.97] transition-transform duration-150">
      <Link href={href} className={`btn btn-lg group relative overflow-hidden ${variant === 'primary' ? 'btn-primary shadow-[0_0_30px_-8px_var(--color-primary)]' : 'btn-glass'} animate-glow-pulse`}>
        {variant === 'primary' && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        {children}
      </Link>
    </div>
  );
};

/** 3D Tilt + Spotlight card */
const TiltSpotlightCard = ({ children, href }: { children: React.ReactNode; href: string }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 80%)`;

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    mouseX.set(px);
    mouseY.set(py);
    rotY.set(((px / r.width) - 0.5) * -10);
    rotX.set(((py / r.height) - 0.5) * 10);
  };

  return (
    <motion.div style={{ perspective: 800 }} className="h-full">
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }} className="h-full">
        <Link
          href={href}
          onMouseMove={handleMove}
          onMouseLeave={() => { rotX.set(0); rotY.set(0); }}
          className="group relative bg-surface/40 border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-surface transition-colors duration-300 h-full overflow-hidden"
        >
          <motion.div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: spotlight }} />
          <div style={{ transform: 'translateZ(30px)' }} className="flex flex-col items-center">
            {children}
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
};

const Typewriter = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !deleting) {
      const t = setTimeout(() => setDeleting(true), 1600);
      return () => clearTimeout(t);
    }
    if (subIndex === 0 && deleting) {
      const t = setTimeout(() => {
        setDeleting(false);
        setIndex((p) => (p + 1) % words.length);
      }, 60);
      return () => clearTimeout(t);
    }
    const timeout = setTimeout(() => setSubIndex((p) => p + (deleting ? -1 : 1)), deleting ? 45 : 95);
    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, words]);

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-primary/85 to-primary/60">
      {words[index].substring(0, subIndex)}
      <span className="motion-safe:animate-pulse text-primary">|</span>
    </span>
  );
};

/** ورود کلمه‌به‌کلمه هدلاین */
const AnimatedWords = ({ text, className = '' }: { text: string; className?: string }) => (
  <span className={className}>
    {text.split(' ').map((word, i) => (
      <span
        key={i}
        className="inline-block ml-[0.28em] animate-fade-in-up"
        style={{ animationDelay: `${0.15 + i * 0.09}s`, animationFillMode: 'both' }}
      >
        {word}
      </span>
    ))}
  </span>
);

const SectionHeader = ({ eyebrow, title, cta }: { eyebrow: string; title: string; cta?: { href: string; label: string } }) => (
  <SlideUp rootMargin="-60px" className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-border pb-6">
    <div>
      <span className="inline-flex items-center gap-2 text-[11px] text-primary uppercase tracking-[0.2em] font-medium mb-3">
        <span className="w-6 h-px bg-gradient-to-l from-primary to-transparent" />
        {eyebrow}
      </span>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{title}</h2>
    </div>
    {cta && (
      <Link href={cta.href} className="btn btn-glass btn-sm group shrink-0">
        {cta.label}
        <Icon d={ICON_PATHS.arrow} className="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" />
      </Link>
    )}
  </SlideUp>
);

const CardSkeleton = () => (
  <div className="bg-surface/40 border border-border rounded-2xl p-6 h-full motion-safe:animate-pulse">
    <Skeleton className="w-12 h-12 rounded-xl mb-4 mx-auto" />
    <SkeletonText className="w-3/4 mx-auto mb-2" />
    <SkeletonText className="w-1/2 mx-auto" />
  </div>
);

/* ============ Page ============ */

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => !!s.token);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [showTop, setShowTop] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const isTouch = useIsTouchDevice();
  const reducedMotion = usePrefersReducedMotion();
  const disableEffects = isTouch || reducedMotion;

  /* progress bar */
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  /* cursor glow */
  const [glowBg, setGlowBg] = useState('');

  useEffect(() => {
    const onScroll = throttle(() => {
      setShowTop(window.scrollY > 800);
    }, 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (!disableEffects) {
      const onMove = (e: MouseEvent) => {
        setGlowBg(`radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 80%)`);
      };
      window.addEventListener('mousemove', onMove);
      return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMove); };
    }
    return () => window.removeEventListener('scroll', onScroll);
  }, [disableEffects]);

  /* keyboard: ESC close, Ctrl+K open — reset query & focus on open */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!quickOpen) {
          setQuickQuery('');
          setTimeout(() => searchInputRef.current?.focus(), 80);
        }
        setQuickOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [quickOpen]);

  const filteredLinks = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) return QUICK_LINKS;
    return QUICK_LINKS.filter((l) => l.label.includes(q) || l.keywords.toLowerCase().includes(q));
  }, [quickQuery]);

  /* data */
  const { data: apiCategories, isLoading: catLoading, isError: catError } = useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: async () => (await api.get('/categories')).data.data,
    staleTime: 300000,
  });
  const categories = apiCategories ?? [];

  const { data: latest, isLoading: listLoading } = useQuery({
    queryKey: queryKeys.listings.latest,
    queryFn: async () => (await api.get('/listings', { params: { sort: 'newest', per_page: 8 } })).data,
  });

  const { data: apiArticles, isLoading: artLoading } = useArticles();
  const homeArticles = apiArticles ?? [];

  return (
    <>
      {!disableEffects && <CustomCursor />}

      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-foreground overflow-x-hidden relative flex flex-col">

      {/* scroll progress */}
      <motion.div style={{ scaleX }} className="fixed top-0 inset-x-0 h-[3px] bg-gradient-to-l from-primary via-primary/80 to-primary origin-right z-50 shadow-[0_0_12px_var(--color-primary)]" />

      {/* cursor glow — only on desktop */}
      {!disableEffects && <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: glowBg }} />}

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

      {/* interactive particles — فقط دسکتاپ (بهینه‌سازی CPU) */}
      {!disableEffects && <ParticleBackground className="fixed inset-0 z-[1] w-full h-full" />}

      {/* ===== 1. HERO ===== */}
      <section ref={heroRef} className="relative z-10 min-h-[88vh] flex flex-col items-center justify-center pt-24 pb-24 px-4">
        {/* aurora blobs — فقط دسکتاپ */}
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

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter mb-6 leading-[1.05]">
            <AnimatedWords text="بازارگاه مدرن" className="text-gradient" />
            <br />
            <span className="animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
              <Typewriter words={['خودرو و ماشین‌آلات', 'ماشین‌آلات سنگین', 'تجهیزات راهسازی', 'ماشین‌آلات کشاورزی']} />
            </span>
          </h1>

          <p className="animate-fade-in-up text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            خرید، فروش و اجاره انواع خودرو سواری، ماشین‌آلات سنگین، راهسازی و کشاورزی با بالاترین استانداردهای امنیتی و کاربری.
          </p>

          <div className="animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-center items-center" style={{ animationDelay: '0.55s', animationFillMode: 'both' }}>
            <MagneticButton href="/dashboard/listings/new" variant="glass">
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
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${trade.type === 'فروش' ? 'bg-success/10 text-success' : trade.type === 'خرید' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
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
                    <div className="relative z-10 flex items-center text-[10px] text-muted-foreground bg-surface-2 px-2 py-1 rounded-full border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
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
        ) : (
          latest?.data?.length > 0 && (
            <SlideUp rootMargin="-60px" className="relative bg-surface/20 border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <ListingGrid listings={latest.data} />
            </SlideUp>
          )
        )}
      </section>

      {/* ===== 5. HOW IT WORKS ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 text-[11px] text-primary uppercase tracking-[0.2em] font-medium mb-3">
            <span className="w-6 h-px bg-primary/50" /> How It Works <span className="w-6 h-px bg-primary/50" />
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">فقط در ۳ مرحله ساده</h2>
        </div>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* connector line */}
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
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
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
            : (homeArticles as Article[])?.slice(0, 4).map((article, i) => (
              <SlideUp key={article.id} delay={i * 0.08} rootMargin="-40px">
                <NewsCard article={article} />
              </SlideUp>
            ))}
        </div>
      </section>

      {/* ===== 7. BENTO FEATURES ===== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-[11px] text-primary uppercase tracking-[0.2em] font-medium mb-3">
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
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest">{stat.label}</span>
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
              <MagneticButton href="/dashboard/listings/new" variant="glass">
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
      {quickOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] p-4 animate-fade-in">
          <div className="fixed inset-0 bg-overlay backdrop-blur-sm" onClick={() => setQuickOpen(false)} />
          <div className="relative z-10 w-full max-w-2xl bg-surface-1/90 border border-border/50 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden animate-scale-in" role="dialog" aria-modal="true">
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

            <div className="px-5 py-3 border-t border-border/30 bg-surface-2/20 text-[11px] text-muted-foreground flex justify-between items-center">
              <span className="flex items-center gap-2">
                <kbd className="bg-surface-2 border border-border rounded px-1.5 py-0.5 font-sans">ESC</kbd> برای بستن
              </span>
              <span>پلتفرم تخصصی بازارگاه</span>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}