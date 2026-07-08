'use client';

import { JSX } from 'react';
import { ImageUploader } from '@/components/upload/ImageUploader';
import { cn } from '@/lib/utils';

// آیکون‌های مدرن SVG
const Icons = {
  alert: <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01" />,
  shieldOff: <path d="M19.69 14A6.9 6.9 0 0 0 19 11m-4-5.5a6.9 6.9 0 0 1 4 5.5 M2 2l20 20 M5 5l3.5 3.5a6.9 6.9 0 0 0 -1.5 4.5v7l4-2 4 2 M12 2a6.9 6.9 0 0 1 4 1.5" />,
  check: <path d="M20 6L9 17l-5-5" />,
};

const Icon = ({ path, className = "h-5 w-5" }: { path: JSX.Element; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {path}
  </svg>
);

interface Step4ImagesProps {
  objectKeys: string[];
  onKeysChange: (keys: string[]) => void;
  skipImages: boolean;
  onSkipImagesChange: (skip: boolean) => void;
}

export function Step4Images({ objectKeys, onKeysChange, skipImages, onSkipImagesChange }: Step4ImagesProps) {
  return (
    <div className="animate-fade-in space-y-10">
      
      {/* هدر مرحله */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">4</div>
          <span className="text-[11px] font-bold tracking-widest text-primary uppercase">STEP 4</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground mb-2">تصاویر آگهی</h2>
        <p className="text-muted-foreground text-sm font-light">
          حداقل ۱ تصویر الزامی است. تصویر اول به عنوان تصویر اصلی در نتایج جستجو نمایش داده می‌شود.
        </p>
      </div>

      {/* کادر شیشه‌ای دور آپلودر */}
      <div className={cn(
        'glass rounded-3xl p-6 md:p-8 transition-all duration-300 border',
        skipImages ? 'border-destructive/30 opacity-40 pointer-events-none' : 'border-border-subtle'
      )}>
        <ImageUploader
          onImagesChange={onKeysChange}
          maxImages={15}
        />
      </div>

      {/* هشدار در صورت عدم انتخاب عکس */}
      {objectKeys.length === 0 && !skipImages && (
        <div className="flex items-start gap-4 glass rounded-3xl p-5 border border-warning/20 bg-warning/5 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shrink-0">
            <Icon path={Icons.alert} className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-warning mb-1 uppercase tracking-wider">تکمیل تصاویر الزامی است</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-light">
              برای ثبت نهایی آگهی، آپلود حداقل یک تصویر باکیفیت الزامی می‌باشد. آگهی‌های دارای عکس تا ۳ برابر بیشتر دیده می‌شوند.
            </p>
          </div>
        </div>
      )}

      {/* گزینه ثبت آگهی بدون عکس (با ریسک کاربر) */}
      {objectKeys.length === 0 && (
        <div className={cn(
          'flex flex-col p-6 rounded-3xl border transition-all duration-300',
          skipImages ? 'glass border-destructive/30 bg-destructive/5' : 'glass border-border-subtle hover:border-border'
        )}>
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors border',
              skipImages ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-surface-2 text-muted-foreground border-border'
            )}>
              <Icon path={Icons.shieldOff} className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className={cn(
                'text-sm font-bold mb-2 transition-colors uppercase tracking-wider',
                skipImages ? 'text-destructive' : 'text-foreground'
              )}>
                ثبت آگهی بدون تصویر (تحت مسئولیت کاربر)
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed font-light">
                ارسال آگهی بدون عکس به عهده کاربر است. توجه داشته باشید آگهی‌های بدون تصویر در سیستم بررسی ریسک (Risk Assessment) به عنوان <span className="font-bold text-destructive">آگهی مشکوک (Fake)</span> شناسایی می‌شوند و ممکن است تا تایید دستی کارشناسان، در نتایج جستجو نمایش داده نشوند یا محدود شوند.
              </p>
              
              <button 
                type="button"
                onClick={() => onSkipImagesChange(!skipImages)}
                className={cn(
                  'mt-5 flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium transition-all active:scale-95',
                  skipImages ? 'btn btn-danger' : 'btn btn-glass'
                )}
              >
                <Icon path={skipImages ? Icons.check : Icons.alert} className="h-4 w-4" />
                {skipImages ? 'تایید ریسک و ثبت بدون عکس فعال شد' : 'متوجه هستم، ثبت بدون عکس را تایید می‌کنم'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}