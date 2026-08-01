'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/common/Modal';
import { usePartsCategories } from '@/hooks/usePartsV2';
import { Loading } from '@/components/common/Loading';

interface PartCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  parent_id?: number | null;
  children?: PartCategory[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  activeId: number | null;
  onSelect: (id: number | null) => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  car: 'M6 30h36l-3-12a4 4 0 00-4-3H13a4 4 0 00-4 3L6 30z',
  truck: 'M2 30h30V14a2 2 0 00-2-2H8a2 2 0 00-2 2v16z',
  motorcycle: 'M13 34l8-20h10l4 20',
  construction: 'M8 36V18a4 4 0 014-4h4l4 8',
  agricultural: 'M14 34l6-22h12l2 6',
};

export function PartsCategoryFilterModal({ open, onClose, activeId, onSelect }: Props) {
  const [selectedRoot, setSelectedRoot] = useState<PartCategory | null>(null);

  const { data: categories, isLoading, isError } = usePartsCategories();
  const roots = useMemo(() => (categories || []) as PartCategory[], [categories]);

  useEffect(() => {
    if (!open) return;
    if (activeId !== null && roots.length) {
      for (const root of roots) {
        if (root.children?.some((c) => c.id === activeId)) {
          setSelectedRoot(root);
          return;
        }
      }
    }
    setSelectedRoot(null);
  }, [open, activeId, roots]);

  const selectAndClose = (id: number | null) => {
    onSelect(id);
    onClose();
  };

  const openRoot = (root: PartCategory) => setSelectedRoot(root);

  return (
    <Modal open={open} onClose={onClose} title="فیلتر دسته‌بندی" className="max-w-2xl">
      {isLoading ? (
        <div className="flex items-center justify-center py-16"><Loading /></div>
      ) : isError ? (
        <p className="text-center text-sm text-destructive py-10">خطا در دریافت دسته‌بندی‌ها</p>
      ) : selectedRoot === null ? (
        <div className="space-y-6">
          <button
            onClick={() => selectAndClose(null)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-colors border',
              activeId === null
                ? 'bg-primary/10 text-primary border-primary/30'
                : 'text-foreground hover:bg-surface-2/60 border-border-subtle',
            )}
          >
            <span>همه قطعات</span>
          </button>

          <div className="max-h-[55vh] overflow-y-auto space-y-3 pl-1">
            {roots.map((root) => (
              <button
                key={root.id}
                onClick={() => openRoot(root)}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-medium text-right transition-all border group bg-surface/60 text-foreground border-border-subtle hover:border-primary/30 hover:bg-surface-2/60"
              >
                <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <svg className="h-5 w-5" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={CATEGORY_ICONS[root.slug] || 'M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4-3.9-3.8 5.4-.8z'} />
                    {root.slug === 'car' && <><circle cx="13" cy="32" r="4" /><circle cx="35" cy="32" r="4" /><path d="M8 26l1-4h30l1 4" /></>}
                    {root.slug === 'truck' && <><path d="M32 30h8l6-8v-4a2 2 0 00-2-2h-12v14z" /><circle cx="11" cy="34" r="4" /><circle cx="33" cy="34" r="4" /></>}
                    {root.slug === 'motorcycle' && <><circle cx="13" cy="34" r="5" /><circle cx="37" cy="34" r="5" /><path d="M31 14h10" /><path d="M37 34l-6-20" /></>}
                    {root.slug === 'construction' && <><rect x="24" y="14" width="10" height="14" rx="1" /><path d="M34 14h8v22" /><circle cx="14" cy="36" r="3" /><circle cx="38" cy="36" r="3" /><path d="M8 26h8" /></>}
                    {root.slug === 'agricultural' && <><circle cx="14" cy="34" r="6" /><circle cx="36" cy="34" r="6" /><rect x="30" y="12" width="10" height="8" rx="1" /><path d="M28 22l-8-2" /><path d="M18 20l4-8" /><path d="M36 34l-6-22" /></>}
                  </svg>
                </span>
                <span className="flex-1 font-bold">{root.name}</span>
                <span className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">
                    {(root.children?.length || 0).toLocaleString('fa-IR')}
                  </span>
                  <svg className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedRoot(null)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              بازگشت به دسته‌ها
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-surface/60 border border-border-subtle">
            <p className="text-sm font-bold text-foreground">{selectedRoot.name}</p>
            <button
              onClick={() => selectAndClose(null)}
              className="text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-border-subtle text-foreground hover:bg-surface-2/60"
            >
              حذف فیلتر
            </button>
          </div>

          <div className="max-h-[55vh] overflow-y-auto pl-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(selectedRoot.children || []).map((type) => {
                const active = activeId === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => selectAndClose(type.id)}
                    className={cn(
                      'flex items-center justify-between gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium text-right transition-all border group',
                      active
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-surface/60 text-foreground border-border-subtle hover:border-primary/30 hover:bg-surface-2/60',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {active && (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {type.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
