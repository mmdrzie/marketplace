'use client';

import Link from 'next/link';
import { SlideUp } from '@/components/common/MotionDiv.client';

const Icon = ({ d, className = 'w-5 h-5' }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

import { ICON_PATHS } from '@/lib/icons';

export function SectionHeader({ eyebrow, title, cta }: { eyebrow: string; title: string; cta?: { href: string; label: string } }) {
  return (
    <SlideUp rootMargin="-60px" className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-border pb-6">
      <div>
        <span className="inline-flex items-center gap-2 text-xs text-primary uppercase tracking-[0.2em] font-medium mb-3">
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
}
