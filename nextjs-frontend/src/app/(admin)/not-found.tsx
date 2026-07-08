import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-4">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-destructive) 10%, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px]" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-indigo) 10%, transparent)' }} />
      </div>
      <div className="relative z-10 w-full max-w-md text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-destructive/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="text-3xl font-black text-foreground mb-3">صفحه مورد نظر یافت نشد</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">مسیر درخواستی در پنل مدیریت وجود ندارد</p>
        <Link href="/admin" className="btn btn-primary">بازگشت به داشبورد مدیریت</Link>
      </div>
    </div>
  );
}
