'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { CompareItem } from '@/store/compareStore';

const BASE_ATTR_LABELS: Record<string, string> = {
  province: 'استان',
  city: 'شهر',
  status: 'وضعیت',
};

function getAttr(item: CompareItem, key: string): string {
  if (key === 'province') return item.province || '—';
  if (key === 'city') return item.city || '—';
  if (key === 'status') return item.status || '—';
  if (item.attributes) {
    const found = item.attributes.find((a) => a.name === key || a.label === key);
    if (found) return found.value + (found.unit ? ` ${found.unit}` : '');
  }
  return '—';
}

function isNumeric(val: string): boolean {
  if (val === '—' || val === '') return false;
  const cleaned = val.replace(/[,،\s]/g, '');
  const parsed = parseFloat(cleaned);
  return !isNaN(parsed) && isFinite(parsed);
}

function parseNumeric(val: string): number {
  return parseFloat(val.replace(/[,،\s]/g, ''));
}

function getAllAttrKeys(items: CompareItem[]): string[] {
  const keys = Object.keys(BASE_ATTR_LABELS);
  items.forEach((item) => {
    if (item.attributes) {
      item.attributes.forEach((a) => {
        if (!keys.includes(a.name)) keys.push(a.name);
      });
    }
  });
  return keys;
}

function attrLabel(key: string): string {
  return BASE_ATTR_LABELS[key] || key;
}

function findBestIndex(values: string[], higherBetter: boolean): number {
  const nums = values.map((v, i) => (isNumeric(v) ? parseNumeric(v) : null));
  const filtered = nums.filter((n): n is number => n !== null);
  if (filtered.length < 2) return -1;
  const best = higherBetter ? Math.max(...filtered) : Math.min(...filtered);
  return nums.indexOf(best);
}

export function SpecComparisonGrid({ items, onRemove }: { items: CompareItem[]; onRemove: (id: number) => void }) {
  const attrKeys = getAllAttrKeys(items);

  return (
    <div className="glass rounded-2xl border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-right p-4 text-muted-foreground font-medium w-28 md:w-36 shrink-0">مشخصات</th>
              {items.map((item) => (
                <th key={item.id} className="p-4 text-center min-w-[180px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground text-sm">{item.title}</span>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                      aria-label="حذف از مقایسه"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  {item.primary_image && (
                    <div className="relative w-full h-24 rounded-xl mt-2 overflow-hidden">
                      <Image src={item.primary_image} alt="" fill sizes="180px" className="object-cover" />
                    </div>
                  )}
                  <div className="mt-2 text-sm font-black text-foreground">
                    {typeof item.price === 'number' ? `${item.price.toLocaleString('fa-IR')} تومان` : item.price_type === 'free' ? 'رایگان' : 'توافقی'}
                  </div>
                  <a
                    href={`/listings/${item.slug}`}
                    className="inline-block mt-2 text-[10px] text-primary hover:text-primary/80 transition-colors"
                  >
                    مشاهده آگهی
                  </a>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attrKeys.map((attr) => {
              const values = items.map((item) => getAttr(item, attr));
              const allNumeric = values.every((v) => isNumeric(v));
              const higherBetter = !['کارکرد', 'مصرف سوخت', 'وزن', 'emission'].some((k) => attr.includes(k));
              const bestIdx = allNumeric ? findBestIndex(values, higherBetter) : -1;

              if (allNumeric) {
                const nums = values.map((v) => (isNumeric(v) ? parseNumeric(v) : 0));
                const maxVal = Math.max(...nums, 1);
                const minVal = Math.min(...nums, 0);
                const range = maxVal - minVal || 1;

                return (
                  <tr key={attr} className="border-b border-border-subtle last:border-0">
                    <td className="p-4 text-muted-foreground font-medium">{attrLabel(attr)}</td>
                    {items.map((item, idx) => {
                      const pct = ((nums[idx] - minVal) / range) * 100;
                      return (
                        <td key={item.id} className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {bestIdx === idx && (
                              <svg className="h-3 w-3 text-success shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                            )}
                            <span className={`font-medium ${bestIdx === idx ? 'text-success' : 'text-foreground'}`}>
                              {values[idx]}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-2 rounded-full mt-1.5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.max(pct, 3)}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                              className={`h-full rounded-full transition-all duration-500 ${
                                bestIdx === idx ? 'bg-success' : 'bg-primary/30'
                              }`}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              }

              return (
                <tr key={attr} className="border-b border-border-subtle last:border-0">
                  <td className="p-4 text-muted-foreground font-medium">{attrLabel(attr)}</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-4 text-center text-foreground">{getAttr(item, attr)}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
