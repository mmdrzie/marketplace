'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import { PriceDisplay } from './PriceDisplay';
import { motion, AnimatePresence } from 'framer-motion';

export function RecentlyViewed() {
  const { items, clearAll } = useRecentlyViewedStore();

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <h3 className="text-sm font-bold text-foreground">بازدیدهای اخیر</h3>
        </div>
        <button onClick={clearAll} className="text-[11px] text-muted-foreground hover:text-destructive transition-colors">
          پاک کردن
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="shrink-0"
            >
              <Link
                href={`/listings/${item.slug}`}
                className="block glass rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 w-44"
              >
                {item.primary_image ? (
                  <div className="aspect-[4/3] bg-muted relative">
                    <Image src={item.primary_image} alt={item.title} fill sizes="176px" className="object-cover" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-xs font-medium text-foreground line-clamp-1 mb-1">{item.title}</p>
                  <p className="text-xs font-bold text-foreground"><PriceDisplay price={item.price} priceType={item.price_type} /></p>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
