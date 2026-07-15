'use client';

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Dock } from '@/components/common/Dock';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
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

  useEffect(() => {
    const saved = scrollPositions.current[pathname];
    if (saved !== undefined) {
      requestAnimationFrame(() => window.scrollTo(0, saved));
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
      <MobileBottomNav />
      <main id="main-content" className="flex-1 relative z-10 pt-16 pb-[66px] md:pb-0">
        {children}
      </main>
      <Footer />
      <AIAssistant />
      <ScrollToTop />
    </div>
  );
}