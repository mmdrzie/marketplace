'use client';

import { toast } from '@/components/common/Toast';

export function ShareButton({ title, url, className }: { title: string; url?: string; className?: string }) {
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = url ? `${window.location.origin}${url}` : window.location.href;
    if (navigator.share) {
      navigator.share({ title, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({ type: 'success', title: 'لینک کپی شد' });
    }
  };

  return (
    <button onClick={handleShare} className={`flex items-center justify-center gap-2 text-[11px] py-2 px-3 rounded-xl bg-background/70 backdrop-blur-sm border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all ${className || ''}`} title="اشتراک‌گذاری">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      اشتراک
    </button>
  );
}
