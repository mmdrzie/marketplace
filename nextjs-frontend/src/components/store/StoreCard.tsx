'use client';

import Link from 'next/link';

interface Store {
  store_name: string;
  store_slug: string;
  description?: string;
  logo?: string;
  owner_name: string;
  part_count: number;
  created_at: string;
}

interface Props {
  store: Store;
  index?: number;
}

export function StoreCard({ store, index = 0 }: Props) {
  return (
    <Link
      href={`/stores/${store.store_slug}`}
      className="block group animate-fade-in-up"
      style={{ animationDelay: `${index * 0.04}s`, animationFillMode: 'both' }}
    >
      <div className="glass rounded-2xl p-5 border border-border-subtle hover:border-primary/20 hover:-translate-y-1 transition-all duration-200 h-full">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {store.logo ? (
              <img src={store.logo} alt={store.store_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-primary">{store.store_name[0]}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {store.store_name}
            </h3>
            <p className="text-xs text-muted-foreground">{store.owner_name}</p>
          </div>
        </div>

        {store.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{store.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            {store.part_count} قطعه
          </span>
        </div>
      </div>
    </Link>
  );
}
