'use client';

import Link from 'next/link';
import { use3DTilt } from '@/hooks/use3DTilt';

interface CatalogEntryCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  linkText?: string;
}

export function CatalogEntryCard({ href, title, description, icon, linkText }: CatalogEntryCardProps) {
  const tiltRef = use3DTilt({ maxTilt: 6, lerp: 0.08 });

  return (
    <div ref={tiltRef} className="glass-3d">
      <div className="glass-3d__inner">
        <div className="glass-3d__spotlight"></div>
        <div className="glass-3d__content p-6">
          <Link href={href} className="catalog-entry group">
            <div className="catalog-entry__icon">
              {icon}
            </div>
            <div className="catalog-entry__text">
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            {linkText && (
              <div className="catalog-entry__link">
                <span>{linkText}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4">
                  <path d="M13 15l-5-5 5-5" />
                </svg>
              </div>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
