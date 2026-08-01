'use client';

import Link from 'next/link';

interface Store {
  store_name: string;
  store_slug: string;
  description?: string;
  logo?: string;
  cover_image?: string;
  address?: string;
  phone?: string;
  owner_name: string;
  inventory?: any[];
}

interface Props {
  store: Store;
}

export function StoreHeader({ store }: Props) {
  return (
    <div className="glass rounded-2xl border border-border-subtle overflow-hidden">
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
      <div className="px-6 pb-6 -mt-12">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-surface border-4 border-background flex items-center justify-center overflow-hidden shadow-lg">
            {store.logo ? (
              <img src={store.logo} alt={store.store_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-primary">{store.store_name[0]}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-12">
            <h1 className="text-2xl font-bold text-foreground">{store.store_name}</h1>
            <p className="text-sm text-muted-foreground">{store.owner_name}</p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs text-muted-foreground">
            {store.address && (
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                {store.address}
              </span>
            )}
            {store.phone && (
              <span className="flex items-center gap-1" dir="ltr">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                {store.phone}
              </span>
            )}
          </div>
        </div>

        {store.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{store.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          {store.inventory?.length || 0} قطعه در فروشگاه
        </div>
      </div>
    </div>
  );
}
