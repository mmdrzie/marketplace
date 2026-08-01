import { ICON_PATHS } from '@/lib/icons';

export interface QuickLink {
  href: string;
  label: string;
  icon: string;
  keywords: string;
}

export const QUICK_LINKS: QuickLink[] = [
  { href: '/news', label: 'اخبار بازار', icon: ICON_PATHS.doc, keywords: 'news اخبار مقاله' },
  { href: '/market-pulse', label: 'نبض بازار', icon: ICON_PATHS.chart, keywords: 'pulse نبض قیمت' },
  { href: '/price-estimator', label: 'برآورد قیمت', icon: ICON_PATHS.search, keywords: 'price قیمت برآورد' },
  { href: '/car-matchmaker', label: 'مشاور خرید', icon: ICON_PATHS.star, keywords: 'مشاور خرید پیشنهاد' },
  { href: '/car-vs-car', label: 'مقایسه فنی', icon: ICON_PATHS.compare, keywords: 'مقایسه فنی خودرو' },
  { href: '/compare', label: 'مقایسه آگهی\u200cها', icon: ICON_PATHS.grid, keywords: 'مقایسه آگهی' },
  { href: '/imported', label: 'خودروهای وارداتی', icon: ICON_PATHS.chart, keywords: 'وارداتی خارجی imported customs' },
  { href: '/imported/customs-calc', label: 'محاسبه هزینه واردات', icon: ICON_PATHS.search, keywords: 'customs گمرک تعرفه واردات' },
  { href: '/parts', label: 'قطعات یدکی', icon: ICON_PATHS.search, keywords: 'قطعات یدکی ادوات parts' },
  { href: '/insurance', label: 'بیمه', icon: ICON_PATHS.shield, keywords: 'بیمه ایران آسیا شخص ثالث بدنه insurance' },
  { href: '/search', label: 'جستجوی پیشرفته', icon: ICON_PATHS.search, keywords: 'جستجو search فیلتر' },
  { href: '/dashboard/listings/new', label: 'ثبت آگهی', icon: ICON_PATHS.plus, keywords: 'ثبت آگهی فروش' },
];
