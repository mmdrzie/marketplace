import Link from 'next/link';
import { FadeIn } from '@/components/common/MotionDiv';

export default function PaymentCancelPage() {
  return (
    <FadeIn>
      <div className="relative min-h-[80vh] bg-background text-foreground flex items-center justify-center p-4">
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-warning/10 rounded-full blur-[150px] z-0 pointer-events-none" />
        <div className="relative z-10 glass rounded-3xl p-10 md:p-14 shadow-2xl max-w-md w-full text-center border border-warning/20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-foreground mb-3">پرداخت لغو شد</h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            فرآیند پرداخت لغو شد. در صورت تمایل می‌توانید مجدداً اقدام کنید.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/wallet" className="w-full py-3 btn btn-primary">
                تلاش مجدد
            </Link>
            <Link href="/listings" className="w-full py-3 btn btn-ghost">
              بازگشت به آگهی‌ها
            </Link>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
