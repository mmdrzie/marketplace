'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-overlay backdrop-blur-xl" />
      <div className="relative max-w-3xl max-h-[80vh] animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <Image src={src} alt="" fill className="object-contain rounded-2xl" sizes="(max-width: 768px) 100vw, 768px" />
        <button onClick={onClose} className="absolute -top-3 -right-3 w-9 h-9 rounded-full glass flex items-center justify-center border border-border text-muted-foreground hover:text-foreground transition-colors shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
    </div>
  );
}
