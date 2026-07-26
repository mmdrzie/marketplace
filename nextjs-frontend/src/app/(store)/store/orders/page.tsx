'use client';

function SvgIcon({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-5 w-5'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {children}
    </svg>
  );
}

export default function StoreOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">سفارشات</h1>
        <p className="text-sm text-muted-foreground mt-1">سفارشات و درخواست‌های قطعات از فروشگاه شما</p>
      </div>

      <div className="glass rounded-2xl p-12 text-center border border-border-subtle">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-purple, #8b5cf6) 10%, transparent)' }}>
          <SvgIcon className="h-8 w-8" style={{ color: '#8b5cf6' }}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></SvgIcon>
        </div>
        <p className="text-muted-foreground mb-2">هیچ سفارشی ثبت نشده است</p>
        <p className="text-xs text-muted-foreground">سفارشات قطعات توسط مشتریان در این بخش نمایش داده خواهد شد</p>
      </div>
    </div>
  );
}
