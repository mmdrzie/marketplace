'use client';

import { PriceDisplay } from '@/components/common/PriceDisplay';
import type { JSX } from 'react';

// آیکون‌های مدرن SVG
const Icons = {
  category: <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M3 7a2 2 0 012-2h3l2 2h7a2 2 0 012 2" />,
  location: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a3 3 0 11-6 0 3 3 0 016 0z" />,
  description: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
  settings: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  tag: <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z M7 7h.01" />,
};

const Icon = ({ path, className = "h-5 w-5" }: { path: JSX.Element; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

interface Step5PreviewProps {
  data: {
    category_id: number | null;
    title: string;
    description: string;
    price: string;
    price_type: string;
    province_id: string;
    city_id: string;
    attributes: Record<string, string>;
  };
  categoryName?: string;
  cityName?: string;
  provinceName?: string;
}

export function Step5Preview({ data, categoryName, cityName, provinceName }: Step5PreviewProps) {
  const validAttributes = Object.entries(data.attributes).filter(([, value]) => value);

  return (
    <div className="animate-fade-in space-y-10">
      
      {/* هدر مرحله */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">5</div>
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">STEP 5</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground mb-2">پیش‌نمایش آگهی</h2>
        <p className="text-muted-foreground text-sm font-light">اطلاعات وارد شده را بررسی کنید. در صورت تایید، آگهی شما پس از بررسی کارشناسان منتشر خواهد شد.</p>
      </div>

      {/* کارت پیش‌نمایش */}
      <div className="glass rounded-3xl p-6 md:p-8 border border-border-subtle shadow-sm space-y-8">
        
        {/* دسته‌بندی و عنوان */}
        <div className="border-b border-border-subtle pb-8">
          <div className="flex items-center gap-2 text-primary mb-4 text-[11px] font-bold uppercase tracking-wider">
            <Icon path={Icons.category} className="h-4 w-4" />
            {categoryName || 'دسته‌بندی نامشخص'}
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-foreground mb-4 leading-snug">
            {data.title || 'عنوان آگهی وارد نشده است'}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-light">
            <Icon path={Icons.location} className="h-4 w-4 text-muted-foreground" />
            {provinceName || ''} {cityName ? `، ${cityName}` : ''}
          </div>
        </div>

        {/* بخش قیمت */}
        <div className="flex items-center justify-between rounded-2xl p-5 border border-primary/20 bg-primary/5">
          <span className="text-foreground font-medium flex items-center gap-2 text-sm">
            <Icon path={Icons.tag} className="h-5 w-5 text-primary" />
            قیمت آگهی
          </span>
          <div className="text-xl font-bold text-primary tracking-tighter">
            <PriceDisplay
              price={data.price ? Number(data.price) : null}
              priceType={data.price_type}
            />
          </div>
        </div>

        {/* بخش توضیحات */}
        <div>
          <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
            <Icon path={Icons.description} className="h-4 w-4 text-muted-foreground" />
            توضیحات
          </h3>
          <div className="text-muted-foreground text-sm whitespace-pre-wrap bg-surface-2/30 border border-border-subtle p-5 rounded-2xl leading-relaxed font-light">
            {data.description || 'توضیحاتی وارد نشده است.'}
          </div>
        </div>

        {/* بخش مشخصات فنی */}
        {validAttributes.length > 0 && (
          <div>
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Icon path={Icons.settings} className="h-4 w-4 text-muted-foreground" />
              مشخصات فنی
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validAttributes.map(([key, value]) => (
                <div 
                  key={key} 
                  className="flex items-center justify-between p-4 bg-surface-2/30 border border-border-subtle rounded-xl"
                >
                  <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wider">{key.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-foreground text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}