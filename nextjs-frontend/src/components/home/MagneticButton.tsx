'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useRef, useCallback } from 'react';

export function MagneticButton({ children, href, variant = 'glass' }: { children: React.ReactNode; href: string; variant?: 'primary' | 'glass' }) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glareAngle = useMotionValue(0);
  const glareOpacity = useMotionValue(0);
  const shadowX = useMotionValue(0);
  const shadowY = useMotionValue(0);

  const spotlight = useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 80%)`;

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    mouseX.set(px);
    mouseY.set(py);
    glareOpacity.set(1);

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    glareAngle.set((angle + 180) % 360);

    const maxOffset = 2;
    const detectionRadius = rect.width * 1.5;
    const dist = Math.min(maxOffset, Math.sqrt(dx * dx + dy * dy) / detectionRadius * maxOffset);
    shadowX.set(-Math.cos(Math.atan2(dy, dx)) * dist);
    shadowY.set(-Math.sin(Math.atan2(dy, dx)) * dist);
  }, []);

  const handleLeave = useCallback(() => {
    glareOpacity.set(0);
    mouseX.set(0);
    mouseY.set(0);
    shadowX.set(0);
    shadowY.set(0);
  }, []);

  return (
    <div className="inline-block active:scale-[0.97] transition-transform duration-150" ref={ref}>
      <Link
        href={href}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={`btn btn-lg group relative overflow-hidden ${variant === 'primary' ? 'btn-primary shadow-[0_0_30px_-8px_var(--color-primary)]' : 'btn-glass'} animate-glow-pulse`}
      >
        {variant === 'primary' && (
          <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: spotlight }}
        />
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: useMotionTemplate`linear-gradient(${glareAngle}deg, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 50%, color-mix(in srgb, var(--color-primary) 10%, transparent) 100%)`,
            opacity: useMotionTemplate`${glareOpacity}`,
          }}
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    </div>
  );
}
