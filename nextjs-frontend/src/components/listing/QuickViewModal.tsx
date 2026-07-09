'use client';

import { useEffect, useRef } from 'react';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import Image from 'next/image';
import type { Listing } from '@/types';

export function QuickViewModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" />
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative glass rounded-3xl max-w-lg w-full p-6 border border-border shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-foreground flex-1">{listing.title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        {listing.primary_image && (
          <div className="relative w-full aspect-[16/9] rounded-2xl mb-4 overflow-hidden">
            <Image src={listing.primary_image} alt={listing.title} fill sizes="100vw" className="object-cover" />
          </div>
        )}
        <div className="text-2xl font-black text-foreground mb-3"><PriceDisplay price={listing.price} priceType={listing.price_type} /></div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <span>{listing.city_name || listing.province_name || '—'}</span>
        </div>
        <a href={`/listings/${listing.slug}`} className="btn btn-primary w-full">مشاهده کامل</a>
      </div>
    </div>
  );
}
