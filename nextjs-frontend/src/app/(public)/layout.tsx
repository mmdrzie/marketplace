'use client';

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Dock } from '@/components/common/Dock';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { AIAssistant } from '@/components/common/AIAssistant';
import { ScrollToTop } from '@/components/common/ScrollToTop';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const scrollPositions = useRef<Record<string, number>>({});
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      scrollPositions.current[prevPathname.current] = window.scrollY;
      prevPathname.current = pathname;
    }
  }, [pathname]);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      
      {/* شبکه پیکسلی ظریف */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      </div>

      <Dock />
      <Sidebar />
      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onAnimationComplete={() => {
              const saved = scrollPositions.current[pathname];
              if (saved !== undefined) {
                requestAnimationFrame(() => window.scrollTo(0, saved));
              }
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <AIAssistant />
      <ScrollToTop />
    </div>
  );
}