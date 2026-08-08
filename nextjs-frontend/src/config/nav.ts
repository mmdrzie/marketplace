import { ICON_PATHS } from '@/lib/icons';

export interface QuickLink {
  href: string;
  label: string;
  icon: string;
  keywords: string;
  category: 'browse' | 'tools' | 'account';
}

export const QUICK_LINKS: QuickLink[] = [
  { href: '/search', label: 'جستجوی پیشرفته', icon: ICON_PATHS.search, keywords: 'جستجو search فیلتر', category: 'browse' },
  { href: '/news', label: 'اخبار بازار', icon: ICON_PATHS.doc, keywords: 'news اخبار مقاله', category: 'browse' },
  { href: '/market-pulse', label: 'نبض بازار', icon: ICON_PATHS.chart, keywords: 'pulse نبض قیمت', category: 'browse' },
  { href: '/imported', label: 'خودروهای وارداتی', icon: ICON_PATHS.truck, keywords: 'وارداتی خارجی imported customs', category: 'browse' },
  { href: '/parts', label: 'قطعات یدکی', icon: ICON_PATHS.parts, keywords: 'قطعات یدکی ادوات parts', category: 'browse' },
  { href: '/insurance', label: 'بیمه', icon: ICON_PATHS.shield, keywords: 'بیمه ایران آسیا شخص ثالث بدنه insurance', category: 'browse' },
  { href: '/price-estimator', label: 'برآورد قیمت', icon: ICON_PATHS.chart, keywords: 'price قیمت برآورد', category: 'tools' },
  { href: '/car-matchmaker', label: 'مشاور خرید', icon: ICON_PATHS.star, keywords: 'مشاور خرید پیشنهاد', category: 'tools' },
  { href: '/car-vs-car', label: 'مقایسه فنی', icon: ICON_PATHS.compare, keywords: 'مقایسه فنی خودرو', category: 'tools' },
  { href: '/compare', label: 'مقایسه آگهی\u200cها', icon: ICON_PATHS.grid, keywords: 'مقایسه آگهی', category: 'tools' },
  { href: '/imported/customs-calc', label: 'محاسبه هزینه واردات', icon: ICON_PATHS.bolt, keywords: 'customs گمرک تعرفه واردات', category: 'tools' },
  { href: '/dashboard/listings/new', label: 'ثبت آگهی', icon: ICON_PATHS.plus, keywords: 'ثبت آگهی فروش', category: 'account' },
];
