'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LABELS: Record<string, string> = {
  '': 'خانه',
  categories: 'دسته‌بندی‌ها',
  news: 'اخبار و مقالات',
  listings: 'آگهی‌ها',
  search: 'جستجو',
  dashboard: 'پنل کاربری',
  messages: 'پیام‌ها',
  favorites: 'علاقه‌مندی‌ها',
  settings: 'تنظیمات',
  wallet: 'کیف پول',
  dealer: 'پنل فروشنده',
  stats: 'آمار',
  subscription: 'اشتراک',
  admin: 'پنل مدیریت',
  moderation: 'بررسی آگهی‌ها',
  users: 'کاربران',
  reports: 'گزارش‌ها',
  provinces: 'استان‌ها',
  attributes: 'ویژگی‌ها',
  new: 'جدید',
  edit: 'ویرایش',
  compare: 'مقایسه',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((segment, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const label = LABELS[segment] || decodeURIComponent(segment).replace(/-/g, ' ');
    return { href, label, isLast: i === segments.length - 1 };
  });

  return (
    <nav className="max-w-7xl mx-auto px-4 pt-6 pb-0" aria-label="مسیر راهنما">
      <ol className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
        <li>
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="sr-only md:not-sr-only">خانه</span>
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {crumb.isLast ? (
              <span className="text-foreground font-medium truncate max-w-[160px] md:max-w-[280px]">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors truncate max-w-[120px]">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
