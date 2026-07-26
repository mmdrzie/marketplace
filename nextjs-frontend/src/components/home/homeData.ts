import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { ICON_PATHS } from '@/lib/icons';
import { QUICK_LINKS } from '@/config/nav';

export { QUICK_LINKS } from '@/config/nav';

export interface PublicStats {
  activeListings: number;
  totalUsers: number;
  totalProvinces: number;
  approvedDealers: number;
}

export function usePublicStats() {
  return useQuery<PublicStats>({
    queryKey: queryKeys.stats,
    queryFn: () => apiGet<PublicStats>('/stats/public'),
  });
}

export const FEATURES = [
  { icon: ICON_PATHS.shield, title: 'تضمین اصالت آگهی', desc: 'تمام آگهی‌ها پیش از انتشار توسط کارشناسان ما بررسی می‌شوند تا معامله‌ای امن داشته باشید.', size: 'md:col-span-2' },
  { icon: ICON_PATHS.search, title: 'موتور جستجوی هوشمند', desc: 'فیلترهای پیشرفته برای دسترسی سریع به دقیق‌ترین نتایج.', size: 'md:col-span-1' },
  { icon: ICON_PATHS.bolt, title: 'ارتباط مستقیم و امن', desc: 'سیستم پیام‌رسان داخلی برای مذاکره بدون نیاز به اشتراک شماره تماس.', size: 'md:col-span-1' },
  { icon: ICON_PATHS.chart, title: 'نمایش ویژه (VIP)', desc: 'با ارتقا آگهی، در صدر نتایج جستجو قرار بگیرید و سرعت فروش خود را چند برابر کنید.', size: 'md:col-span-2' },
];

export const STEPS = [
  { icon: ICON_PATHS.user, title: 'ثبت\u200cنام سریع', desc: 'در کمتر از یک دقیقه حساب کاربری خود را بسازید و وارد بازار شوید.' },
  { icon: ICON_PATHS.camera, title: 'ثبت آگهی حرفه\u200cای', desc: 'تصاویر و مشخصات فنی را وارد کنید؛ کارشناسان ما آگهی را تأیید می\u200cکنند.' },
  { icon: ICON_PATHS.message, title: 'معامله امن', desc: 'با خریداران واقعی از طریق پیام\u200cرسان داخلی مذاکره و معامله کنید.' },
];

export const MARKET_TICKER = [
  { type: 'فروش', item: 'بیل مکانیکی کوماتسو PC200', location: 'تهران', price: '۸.۵ میلیارد' },
  { type: 'خرید', item: 'کامیون فول ۳۵۰', location: 'اصفهان', price: '۳.۲ میلیارد' },
  { type: 'فروش', item: 'گریدر کوماتسو GD405', location: 'خراسان رضوی', price: '۱۲ میلیارد' },
  { type: 'اجاره', item: 'بیل بک کاترپیلار 320', location: 'خوزستان', price: 'روزانه ۸ میلیون' },
  { type: 'فروش', item: 'لودر ولوو DL420', location: 'البرز', price: '۹.۸ میلیارد' },
];
