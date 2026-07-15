import Link from 'next/link';
import Image from 'next/image';
import { ListingGrid } from '@/components/listing/ListingGrid';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';
import { formatDate } from '@/lib/utils';
import type { User, Listing } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let user: User | null = null;
  let listings: Listing[] = [];
  try {
    const [userRes, listingsRes] = await Promise.all([
      fetch(`${BASE_URL}/api/v1/users/${id}/profile`, { next: { revalidate: 60 } }),
      fetch(`${BASE_URL}/api/v1/listings?seller_id=${id}`, { next: { revalidate: 60 } }),
    ]);
    if (userRes.ok) user = (await userRes.json()).data;
    if (listingsRes.ok) listings = (await listingsRes.json()).data ?? [];
  } catch {
    /* empty */
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-surface-2 border border-border-subtle flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
          <h1 className="text-2xl font-black text-foreground mb-2">کاربر یافت نشد</h1>
          <p className="text-muted-foreground mb-6">کاربر مورد نظر در سیستم ثبت نشده است.</p>
          <Link href="/" className="btn btn-primary">بازگشت به صفحه اصلی</Link>
        </div>
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-indigo) 8%, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[130px] -z-0" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent-blue) 8%, transparent)' }} />
        <div className="relative z-10">
          <Breadcrumbs />

          <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            {/* Profile card */}
            <div className="glass rounded-3xl border border-border-subtle p-6 md:p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  {user?.avatar ? (
                    <div className="w-20 h-20 rounded-full p-0.5 bg-gradient-accent">
                      <Image src={user.avatar} alt={user.name || 'avatar'} width={80} height={80} className="w-full h-full rounded-full object-cover border-2 border-background" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center text-3xl font-black text-white shadow-lg">
                      {user?.name?.[0] || '?'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 text-center sm:text-right">
                  <h1 className="text-2xl md:text-3xl font-black text-foreground">{user?.name || 'کاربر'}</h1>

                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                    {user?.city && (
                      <span className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {user.city}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      عضویت از {user?.created_at ? formatDate(user.created_at) : '-'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      {listings.length.toLocaleString('fa-IR')} آگهی
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Listings */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                <h2 className="text-lg font-black text-foreground">آگهی‌های کاربر</h2>
                <span className="text-xs text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">{listings.length.toLocaleString('fa-IR')}</span>
              </div>

              {listings.length > 0 ? (
                <ListingGrid listings={listings} />
              ) : (
                <div className="glass rounded-3xl p-12 text-center border border-border-subtle">
                  <div className="mb-3"><svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
                  <p className="text-muted-foreground text-sm">این کاربر هنوز آگهی ثبت نکرده است.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
