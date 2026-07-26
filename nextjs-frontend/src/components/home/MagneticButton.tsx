'use client';

import Link from 'next/link';

export function MagneticButton({ children, href, variant = 'glass' }: { children: React.ReactNode; href: string; variant?: 'primary' | 'glass' }) {
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
}
