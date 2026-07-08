'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ListingImage } from '@/types';

interface ListingGalleryProps {
  images: ListingImage[];
}

// آیکون مدرن برای حالت بدون عکس
const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export function ListingGallery({ images }: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' && activeIndex < images.length - 1) setActiveIndex((i) => i + 1);
    if (e.key === 'ArrowLeft' && activeIndex > 0) setActiveIndex((i) => i - 1);
  }, [activeIndex, images.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!images?.length) {
    return (
      <div className="aspect-[4/3] glass rounded-3xl flex flex-col items-center justify-center text-muted-foreground gap-3">
        <ImageIcon />
        <span className="text-sm">تصویری برای این آگهی ثبت نشده است</span>
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div className="space-y-4">
      
      {/* تصویر اصلی */}
      <div className="relative aspect-[4/3] glass rounded-3xl overflow-hidden group">
        <Image
          src={active.url}
          alt="تصویر آگهی"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* گرادینت محو برای خوانایی بهتر شمارنده */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-background/10 pointer-events-none"></div>

        {/* شمارنده تصاویر مدرن */}
        <div className="absolute bottom-4 right-4 bg-background/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-border-subtle/50 shadow-lg">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* تصاویر کوچک (Thumbnails) */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                i === activeIndex
                  ? 'border-primary shadow-glow-accent scale-105'
                  : 'border-border opacity-60 hover:opacity-100 hover:border-border-subtle'
              }`}
              aria-label={`نمایش تصویر ${i + 1}`}
            >
              <Image 
                src={img.thumbnail_url || img.url} 
                alt={`تصویر ${i + 1}`} 
                width={80}
                height={80}
                className="w-full h-full object-cover" 
              />
              {/* لایه تیره روی تصاویر غیر فعال */}
              {i !== activeIndex && (
                <div className="absolute inset-0 bg-background/40 transition-opacity duration-300"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}