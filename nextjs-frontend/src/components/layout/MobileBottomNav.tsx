'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
// SVG icon paths
const icons = {
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  search: <><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  heart: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
};

function SvgIcon({ path, className = 'h-5 w-5' }: { path: React.ReactNode; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
  );
}

export function MobileBottomNav() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();

  // تابع بررسی مسیر فعال برای رنگ دهی آیکون‌ها
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const navItemClass = (path: string) => 
    `flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-300 ${
      isActive(path) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden">
      <div className="bg-background/80 backdrop-blur-xl border-t border-border shadow-lg pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 relative">
          
          {/* خانه */}
          <Link href="/" className={navItemClass('/')}>
            <SvgIcon path={icons.home} className={`h-[22px] w-[22px] ${isActive('/') ? 'fill-accent-blue/20' : ''}`} />
            <span>خانه</span>
          </Link>

          {/* جستجو */}
          <Link href="/search" className={navItemClass('/search')}>
            <SvgIcon path={icons.search} className="h-[22px] w-[22px]" />
            <span>جستجو</span>
          </Link>

          {/* ثبت آگهی (دکمه برآمده نئونی) */}
          {isAuthenticated && (
            <Link 
              href="/dashboard/listings/new" 
              className="flex flex-col items-center justify-center text-[10px] font-medium text-primary"
            >
              <div className="w-12 h-12 -mt-6 rounded-full bg-gradient-accent flex items-center justify-center shadow-glow-accent border-4 border-background transition-transform active:scale-90">
                <SvgIcon path={icons.plus} className="h-6 w-6 text-white" />
              </div>
              <span className="mt-1">ثبت آگهی</span>
            </Link>
          )}

          {/* علاقه‌مندی‌ها */}
          {isAuthenticated && (
            <Link href="/dashboard/favorites" className={navItemClass('/dashboard/favorites')}>
              <SvgIcon path={icons.heart} className={`h-[22px] w-[22px] ${isActive('/dashboard/favorites') ? 'fill-destructive text-destructive' : ''}`} />
              <span>علاقه‌مندی</span>
            </Link>
          )}

          {/* پنل کاربری / ورود */}
          <Link 
            href={isAuthenticated ? '/dashboard' : '/login'} 
            className={navItemClass(isAuthenticated ? '/dashboard' : '/login')}
          >
            <SvgIcon path={icons.user} className={`h-[22px] w-[22px] ${isActive('/dashboard') ? 'fill-accent-blue/20' : ''}`} />
            <span>{isAuthenticated ? 'پنل' : 'ورود'}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}