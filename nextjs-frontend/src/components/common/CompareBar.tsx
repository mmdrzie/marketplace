'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCompareStore } from '@/store/compareStore';
import { toast } from './Toast';

export function CompareBar() {
  const items = useCompareStore((s) => s.items);
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const count = items.length;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] border-t border-border bg-background/80 backdrop-blur-xl animate-slide-up">
      {/* سرصفحه — همیشه نمایش داده می‌شود */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-3 flex items-center gap-3">
        {/* دکمه باز/بستن در موبایل */}
        <button
          onClick={() => setExpanded((e) => !e)}
          className="flex md:hidden items-center gap-2 shrink-0 min-h-[44px] px-2"
        >
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </motion.svg>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-foreground">مقایسه</span>
          <span className="text-[10px] text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">{count}/4</span>
        </div>

        {/* لیست آیتم‌ها — دسکتاپ همیشه نمایش, موبایل only در expanded */}
        <div className="hidden md:flex flex-1 items-center gap-3 overflow-x-auto scrollbar-none">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 shrink-0 bg-surface-2 rounded-xl px-3 py-1.5 border border-border-subtle"
            >
              {item.primary_image && (
                <Image src={item.primary_image} alt="" width={32} height={24} className="rounded object-cover" />
              )}
              <span className="text-[11px] text-foreground font-medium truncate max-w-[100px]">{item.title}</span>
              <button
                onClick={() => { useCompareStore.getState().removeItem(item.id); toast({ type: 'info', title: 'از مقایسه حذف شد', message: item.title }); }}
                className="mr-1 text-muted-foreground hover:text-destructive transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 mr-auto md:mr-0">
          <button
            onClick={() => { useCompareStore.getState().clearAll(); toast({ type: 'info', title: 'همه موارد از مقایسه حذف شدند' }); }}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 min-h-[44px]"
          >
            پاک کردن
          </button>
          <Link
            href="/compare"
            className="text-[11px] font-bold bg-primary hover:bg-primary/90 text-white px-4 py-2 md:py-1.5 rounded-xl transition-colors"
          >
            مقایسه کن
          </Link>
        </div>
      </div>

      {/* لیست بازشونده موبایل */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ maxHeight: 0, opacity: 0 }}
            animate={{ maxHeight: 200, opacity: 1 }}
            exit={{ maxHeight: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-border"
          >
            <div className="flex gap-3 px-3 py-3 overflow-x-auto scrollbar-none">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col items-center gap-2 shrink-0 bg-surface-2 rounded-xl p-3 border border-border-subtle min-w-[140px]"
                >
                  {item.primary_image && (
                    <div className="relative w-full h-20">
                      <Image src={item.primary_image} alt="" fill className="rounded-lg object-cover" sizes="140px" />
                    </div>
                  )}
                  <span className="text-xs text-foreground font-medium text-center line-clamp-2 leading-tight">{item.title}</span>
                  <button
                    onClick={() => { useCompareStore.getState().removeItem(item.id); toast({ type: 'info', title: 'از مقایسه حذف شد', message: item.title }); }}
                    className="text-muted-foreground hover:text-destructive transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
