'use client';

import { memo } from 'react';
import { User } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { TrustBadge, getTier, getScore } from '@/components/common/TrustBadge';

interface SellerCardProps {
  seller: User;
}

const SellerCard = memo(function SellerCard({ seller }: SellerCardProps) {
  const isDealer = seller.role === 'dealer' || seller.role === 'agency';
  const dp = seller.dealer_profile;
  const link = isDealer ? `/dealers/${seller.id}` : `/users/${seller.id}`;
  const displayName = isDealer && dp?.business_name ? dp.business_name : seller.name || 'کاربر';
  const displayLogo = isDealer && dp?.logo ? dp.logo : seller.avatar;
  const dealsCount = (seller as { reviews_count?: number })?.reviews_count || 0;
  const score = getScore(dp?.is_verified, dealsCount, !!dp?.subscription_plan);
  const tier = getTier(dealsCount);

  return (
    <Link
      href={link}
      className="block group glass rounded-3xl p-6 hover:border-primary/30 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {isDealer
              ? <><path d="M3 9l1.5-4.5A1 1 0 015.45 4h13.1a1 1 0 01.95.5L21 9m-18 0h18m-18 0v10a1 1 0 001 1h16a1 1 0 001-1V9M9 20v-6h6v6" /></>
              : <><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></>
            }
          </svg>
        </div>
        <h3 className="font-bold text-foreground text-sm">{isDealer ? 'اطلاعات فروشنده' : 'اطلاعات کاربر'}</h3>
      </div>

      {/* Body */}
      <div className="flex items-center gap-4">
        {/* Avatar / Logo */}
        <div className="relative shrink-0">
          {displayLogo ? (
            <div className={`${isDealer ? 'w-16 h-16 rounded-2xl' : 'w-16 h-16 rounded-full'} p-0.5 bg-gradient-accent`}>
              <Image
                src={displayLogo}
                alt={displayName}
                width={64}
                height={64}
                className={`w-full h-full object-cover border-2 border-background ${isDealer ? 'rounded-2xl' : 'rounded-full'}`}
              />
            </div>
          ) : (
            <div className={`w-16 h-16 bg-gradient-accent flex items-center justify-center text-2xl font-black text-white shadow-glow-accent ${isDealer ? 'rounded-2xl' : 'rounded-full'}`}>
              {displayName[0] || '?'}
            </div>
          )}

          {/* Verified badge */}
          {dp?.is_verified && (
            <span className="absolute -bottom-1 -left-1 w-6 h-6 bg-gradient-accent rounded-full flex items-center justify-center border-2 border-background shadow-lg" title="تأیید شده">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {displayName}
            </p>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground shrink-0 group-hover:-translate-x-1 group-hover:text-primary transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </div>

          {/* City */}
          {seller.city && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {seller.city}
            </p>
          )}

          {/* Trust badge + role tag */}
          <div className="flex items-center gap-2 mt-2">
            {isDealer && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-warning/10 text-warning px-2 py-0.5 rounded-full border border-warning/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l1.5-4.5A1 1 0 015.45 4h13.1a1 1 0 01.95.5L21 9m-18 0h18m-18 0v10a1 1 0 001 1h16a1 1 0 001-1V9M9 20v-6h6v6" /></svg>
                {seller.role === 'agency' ? 'آژانس' : 'نمایندگی'}
              </span>
            )}
            <TrustBadge tier={tier} score={score} className="scale-90 origin-right" />
          </div>
        </div>
      </div>
    </Link>
  );
});

export { SellerCard };
