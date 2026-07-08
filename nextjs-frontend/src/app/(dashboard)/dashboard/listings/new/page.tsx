'use client';

import { ListingForm } from '@/components/listing/ListingForm';
import { ProfileCompletionGuard } from '@/components/common/ProfileCompletionGuard';
import { JSX } from 'react/jsx-runtime';

// آیکون‌های مدرن SVG برای نکات (استیکرها)
const TipsIcons = {
  camera: <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z" />,
  tag: <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />,
  text: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  shield: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
};

const Icon = ({ path, className = "h-6 w-6" }: { path: JSX.Element; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

// نکات منطقی برای ثبت آگهی بهتر (با متغیرهای تم هماهنگ شدند)
const TIPS = [
  { icon: TipsIcons.camera, title: 'عکس‌های باکیفیت', desc: 'از زوایای مختلف و نور مناسب استفاده کنید.', color: 'text-primary', glow: 'bg-primary/10' },
  { icon: TipsIcons.tag, title: 'قیمت منطقی', desc: 'با بررسی آگهی‌های مشابه، قیمت منصفانه وارد کنید.', color: 'text-success', glow: 'bg-success/10' },
  { icon: TipsIcons.text, title: 'توضیحات کامل', desc: 'جزئیات فنی، کارکرد و وضعیت آگهی را شفاف بنویسید.', color: 'text-warning', glow: 'bg-warning/10' },
  { icon: TipsIcons.shield, title: 'اطلاعات واقعی', desc: 'تلفن و اطلاعات تماس معتبر وارد کنید تا تایید شوید.', color: 'text-destructive', glow: 'bg-destructive/10' },
];

export default function NewListingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* پس‌زمینه داینامیک معماری */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16 space-y-8">
        
        {/* هدر صفحه */}
        <div className="glass rounded-3xl p-6 md:p-8 shadow-xl border border-border-subtle overflow-hidden relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-0"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-primary items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground mb-2">ثبت آگهی جدید</h1>
              <p className="text-muted-foreground text-sm md:text-base font-light">
                با تکمیل اطلاعات زیر، آگهی خود را به هزاران خریدار نمایش دهید.
              </p>
            </div>
          </div>
        </div>

        {/* بخش استیکرها و نکات طلایی */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {TIPS.map((tip, index) => (
            <div key={index} className="bg-surface/40 border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-primary/40 hover:bg-surface transition-all duration-300 group backdrop-blur-sm">
              <div className={`w-10 h-10 rounded-xl ${tip.glow} flex items-center justify-center ${tip.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon path={tip.icon} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">{tip.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* کادر فرم اصلی */}
        <div className="glass rounded-3xl p-6 md:p-10 shadow-xl border border-border-subtle">
          {/* 
            توجه: کامپوننت ListingForm خود باید دارک مود باشد. 
            اگر نبود، باید کلاس‌های ورودی‌های آن را آپدیت کنید.
          */}
          <ProfileCompletionGuard>
            <ListingForm />
          </ProfileCompletionGuard>
        </div>
      </div>
    </div>
  );
}