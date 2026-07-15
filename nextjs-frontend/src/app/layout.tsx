import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import { Vazirmatn } from 'next/font/google';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
const LogoutModalProvider = dynamic(() => import('@/components/common/LogoutModalProvider').then(mod => mod.LogoutModalProvider));
import { ApiErrorHandler } from '@/components/common/ApiErrorHandler';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { ToastContainer } from '@/components/common/Toast';
import { CompareBar } from '@/components/common/CompareBar';
import { PWAProvider } from '@/components/common/PWAProvider';
import { DeviceDetector } from '@/components/common/DeviceDetector';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Team Decision | بازارگاه خودرو و ماشین‌آلات',
    template: '%s | Team Decision',
  },
  description: 'بازارگاه آنلاین خرید و فروش خودرو، ماشین‌آلات راهسازی، کشاورزی و تجهیزات صنعتی در سراسر ایران',
  keywords: ['خرید خودرو', 'فروش خودرو', 'ماشین آلات راهسازی', 'تراکتور', 'یل مکانیکی', 'کامیون', 'بازارگاه'],
  authors: [{ name: 'Team Decision' }],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Team Decision | بازارگاه خودرو و ماشین‌آلات',
    description: 'خرید، فروش و جستجوی انواع خودرو و ماشین‌آلات صنعتی با امنیت و سرعت بالا',
    type: 'website',
    locale: 'fa_IR',
    siteName: 'Team Decision',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Team Decision | بازارگاه خودرو و ماشین‌آلات',
    description: 'خرید، فروش و جستجوی انواع خودرو و ماشین‌آلات صنعتی',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Team Decision',
    'mobile-web-app-capable': 'yes',
  },
};

// برای کنترل رنگ نوار مرورگر در موبایل (PWA vibe) — منطبق با توکن‌های واقعی تم
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8dcd0' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0c' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} font-vazirmatn antialiased bg-background text-foreground overflow-x-hidden`}>
        <ThemeProvider>
          <QueryProvider>
            <PWAProvider>
              <AuthProvider>
                {/* Skip link for keyboard / screen-reader users */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:shadow-lg"
                >
                  پرش به محتوای اصلی
                </a>
                <div className="min-h-screen flex flex-col bg-transparent transition-colors duration-300">
                  {children}
                </div>
                <LogoutModalProvider />
                <ApiErrorHandler />
                <ScrollToTop />
                <ToastContainer />
                <CompareBar />
                <DeviceDetector />
                <Analytics />
              </AuthProvider>
            </PWAProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
