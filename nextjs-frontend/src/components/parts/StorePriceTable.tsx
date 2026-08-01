'use client';

import Link from 'next/link';

interface StoreItem {
  inventory_id: number;
  price: number;
  stock_count: number;
  stock_status: string;
  store_name: string;
  store_slug: string;
  logo?: string;
  store_user_id: string;
}

interface Props {
  stores: StoreItem[];
}

export function StorePriceTable({ stores }: Props) {
  if (!stores || stores.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        هیچ فروشنده‌ای برای این قطعه یافت نشد
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {stores.map((item) => (
        <div key={item.inventory_id} className="glass rounded-2xl p-4 border border-border-subtle flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-black text-primary">{item.store_name[0]}</span>
            </div>
            <div className="min-w-0">
              <Link href={`/stores/${item.store_slug}`} className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate block">
                {item.store_name}
              </Link>
              <span className={`text-[10px] ${item.stock_count > 0 ? 'text-success' : 'text-destructive'}`}>
                {item.stock_count > 0 ? `موجودی: ${item.stock_count}` : 'ناموجود'}
              </span>
            </div>
          </div>
          <div className="text-left shrink-0">
            <p className="text-sm font-black text-foreground">{item.price.toLocaleString('fa-IR')} <span className="text-[9px] text-muted-foreground font-normal">تومان</span></p>
            <Link
              href={`/chat?userId=${item.store_user_id}`}
              className="text-[10px] text-primary hover:underline"
            >
              استعلام / چت
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
