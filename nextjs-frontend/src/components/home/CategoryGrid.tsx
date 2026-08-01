'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/types';
import { ICON_PATHS } from '@/lib/icons';
import { TiltSpotlightCard } from './TiltSpotlightCard';
import { CardSkeleton } from './CardSkeleton';
import { SlideUp } from '@/components/common/MotionDiv.client';

const HOME_CATEGORY_SLUGS = ['vehicles', 'motorcycles', 'tractor-head', 'trailer', 'truck', 'light-truck', 'agricultural-machinery'];

const SUBCAT_LABEL: Record<string, string> = {
  vehicles: 'نوع بدنه',
  'construction-machinery': 'نوع ماشین‌آلات',
  'agricultural-machinery': 'نوع ماشین‌آلات',
  'industrial-machinery': 'نوع تجهیزات',
  motorcycles: 'نوع موتورسیکلت',
  'bus-van': 'نوع وسیله',
  truck: 'نوع محور',
  trailer: 'نوع تریلر',
  'light-truck': 'نوع کاربری',
  'tractor-head': 'نوع کشنده',
  parts: 'دسته قطعات',
};

function Icon({ d, className = "w-5 h-5" }: { d: string; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={d} />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function RowCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}>
      {checked && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="20 6 9 17 4 12" /></svg>
      )}
    </span>
  );
}

function RowIndeterminate() {
  return (
    <span className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all bg-primary/60 border-primary text-primary-foreground">
      <span className="w-2 h-0.5 bg-white rounded-full" />
    </span>
  );
}

function SelectRow({ child, depth, selectedSlugs, expandedSlugs, onToggle, onExpand, onSelectAll }: {
  child: Category;
  depth: number;
  selectedSlugs: Set<string>;
  expandedSlugs: Set<string>;
  onToggle: (slug: string) => void;
  onExpand: (slug: string) => void;
  onSelectAll: (slug: string, childSlugs: string[], select: boolean) => void;
}) {
  const hasChildren = child.children && child.children.length > 0;
  const isExpanded = expandedSlugs.has(child.slug);

  if (hasChildren) {
    const childSlugs = child.children!.map((c) => c.slug);
    const selectedCount = childSlugs.filter((s) => selectedSlugs.has(s)).length;
    const allSelected = selectedCount === childSlugs.length;
    const someSelected = selectedCount > 0 && !allSelected;
    const groupLabel = SUBCAT_LABEL[child.slug] || '';

    return (
      <div>
        <button
          type="button"
          onClick={() => onExpand(child.slug)}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-border bg-surface/10 hover:bg-surface transition-all text-right"
          style={{ marginRight: depth * 20 }}
        >
          <ChevronDown open={isExpanded} />
          <span className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">{child.name}</span>
          {allSelected && !someSelected && <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">همه</span>}
          {someSelected && <span className="text-[10px] text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">{selectedCount}</span>}
        </button>
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {groupLabel && (
              <div className="text-[10px] text-muted-foreground tracking-wide px-1 pt-1 pb-0.5" style={{ marginRight: (depth + 1) * 20 }}>
                {groupLabel}
              </div>
            )}
            <button
              type="button"
              onClick={() => onSelectAll(child.slug, childSlugs, !allSelected)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all text-right"
              style={{ marginRight: (depth + 1) * 20 }}
            >
              {someSelected ? <RowIndeterminate /> : <RowCheckbox checked={allSelected} />}
              <span className="text-xs font-medium text-primary flex-1 min-w-0 truncate">انتخاب همه</span>
              <span className="text-[10px] text-muted-foreground">{childSlugs.length} مورد</span>
            </button>
            {child.children!.map((grandchild) => (
              <SelectRow
                key={grandchild.id}
                child={grandchild}
                depth={depth + 1}
                selectedSlugs={selectedSlugs}
                expandedSlugs={expandedSlugs}
                onToggle={onToggle}
                onExpand={onExpand}
                onSelectAll={onSelectAll}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const checked = selectedSlugs.has(child.slug);
  return (
    <button
      type="button"
      onClick={() => onToggle(child.slug)}
      className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border transition-all text-right ${
        checked ? 'bg-primary/10 border-primary/40' : 'bg-surface/30 border-transparent hover:bg-surface hover:border-border'
      }`}
      style={{ marginRight: depth * 20 }}
    >
      <RowCheckbox checked={checked} />
      <span className="text-sm text-foreground flex-1 min-w-0 truncate">{child.name}</span>
    </button>
  );
}

function CategoryModal({ cat, onClose }: { cat: Category; onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());
  const hasChildren = cat.children && cat.children.length > 0;
  const groupLabel = SUBCAT_LABEL[cat.slug] || '';

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const toggle = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const expand = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = (_slug: string, childSlugs: string[], select: boolean) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      for (const s of childSlugs) {
        if (select) next.add(s);
        else next.delete(s);
      }
      return next;
    });
  };

  const handleView = () => {
    onClose();
    if (selectedSlugs.size > 0) {
      router.push(`/search?category=${Array.from(selectedSlugs).join(',')}`);
    } else {
      router.push(`/search?category=${cat.slug}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl w-full max-w-md border border-border shadow-2xl overflow-hidden animate-dropdown flex flex-col"
        style={{ maxHeight: '520px' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary shrink-0">
              <Icon d={ICON_PATHS[cat.slug as keyof typeof ICON_PATHS] || ICON_PATHS.default} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground truncate">{cat.name}</h2>
              <p className="text-[11px] text-muted-foreground">
                {hasChildren ? `${cat.children!.length} زیردسته` : 'بدون زیردسته'}
                {selectedSlugs.size > 0 && ` • ${selectedSlugs.size} انتخاب`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all shrink-0">
            <Icon d="M18 6L6 18M6 6l12 12" className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {hasChildren ? (
            <div className="space-y-1">
              {groupLabel && (
                <div className="text-[11px] text-muted-foreground/70 tracking-wide px-1 pb-1.5 font-medium">
                  {groupLabel}
                </div>
              )}
              {cat.children!.map((child) => (
                <SelectRow
                  key={child.id}
                  child={child}
                  depth={0}
                  selectedSlugs={selectedSlugs}
                  expandedSlugs={expandedSlugs}
                  onToggle={toggle}
                  onExpand={expand}
                  onSelectAll={selectAll}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <p>هیچ زیردسته‌ای وجود ندارد</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 p-4 pt-0 border-t border-border shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm">
            انصراف
          </button>
          <button
            type="button"
            onClick={handleView}
            className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm"
          >
            {selectedSlugs.size > 0 ? `مشاهده (${selectedSlugs.size})` : `همه ${cat.name}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function AllCategoriesModal({ categories, onClose }: { categories: Category[]; onClose: () => void }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());
  const [expandedSlugs, setExpandedSlugs] = useState<Set<string>>(new Set());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const toggle = (slug: string) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const expand = (slug: string) => {
    setExpandedSlugs((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = (_slug: string, childSlugs: string[], select: boolean) => {
    setSelectedSlugs((prev) => {
      const next = new Set(prev);
      for (const s of childSlugs) {
        if (select) next.add(s);
        else next.delete(s);
      }
      return next;
    });
  };

  const handleView = () => {
    onClose();
    if (selectedSlugs.size > 0) {
      router.push(`/search?category=${Array.from(selectedSlugs).join(',')}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl w-full max-w-lg border border-border shadow-2xl overflow-hidden animate-dropdown flex flex-col"
        style={{ maxHeight: '560px' }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary shrink-0">
              <Icon d="M4 6h16M4 12h16M4 18h16" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-foreground truncate">همه دسته‌بندی‌ها</h2>
              <p className="text-[11px] text-muted-foreground">
                {categories.length} دسته اصلی
                {selectedSlugs.size > 0 && ` • ${selectedSlugs.size} انتخاب`}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg bg-surface-2 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all shrink-0">
            <Icon d="M18 6L6 18M6 6l12 12" className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="space-y-1">
            {categories.map((cat) => (
              <SelectRow
                key={cat.id}
                child={cat}
                depth={0}
                selectedSlugs={selectedSlugs}
                expandedSlugs={expandedSlugs}
                onToggle={toggle}
                onExpand={expand}
                onSelectAll={selectAll}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 pt-0 border-t border-border shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 btn btn-ghost rounded-xl text-sm">
            انصراف
          </button>
          <button
            type="button"
            onClick={handleView}
            className="flex-1 py-2.5 btn btn-primary rounded-xl text-sm"
          >
            {selectedSlugs.size > 0 ? `مشاهده (${selectedSlugs.size})` : 'کاوش هوشمند'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CategoryGrid({ categories, catLoading, catError, showAllTrigger }: { categories: Category[]; catLoading: boolean; catError: unknown; showAllTrigger?: number }) {
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [showAll, setShowAll] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showAllTrigger) setShowAll(true);
  }, [showAllTrigger]);

  useEffect(() => {
    if ((selectedCat || showAll) && gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedCat, showAll]);

  const visibleCats = (categories as Category[])?.filter((c) =>
    HOME_CATEGORY_SLUGS.includes(c.slug)
  ) || [];

  if (catLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (catError) {
    return (
      <div className="col-span-4 text-center py-12">
        <p className="text-sm text-muted-foreground">خطا در بارگذاری دسته‌بندی‌ها</p>
      </div>
    );
  }

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visibleCats.map((cat, i) => (
          <SlideUp key={cat.id} delay={i * 0.05} rootMargin="-40px" className="h-full">
            <TiltSpotlightCard onClick={() => setSelectedCat(cat)}>
              <div className="relative z-10 w-12 h-12 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_0_20px_-6px_var(--color-primary)] transition-all duration-300">
                <Icon d={ICON_PATHS[cat.slug as keyof typeof ICON_PATHS] || ICON_PATHS.default} className="w-6 h-6" />
              </div>
              <h3 className="relative z-10 font-medium text-foreground group-hover:text-primary transition-colors mb-2">{cat.name}</h3>
              <div className="relative z-10 flex items-center text-xs text-muted-foreground bg-surface-2 px-2 py-1 rounded-full border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                {cat.children && cat.children.length > 0 ? `${cat.children.length} زیردسته` : 'مشاهده آگهی‌ها'}
              </div>
            </TiltSpotlightCard>
          </SlideUp>
        ))}

        <SlideUp delay={visibleCats.length * 0.05} rootMargin="-40px" className="h-full">
          <TiltSpotlightCard onClick={() => setShowAll(true)}>
            <div className="relative z-10 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary mb-4 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <h3 className="relative z-10 font-medium text-foreground group-hover:text-primary transition-colors mb-2">همه دسته‌بندی‌ها</h3>
            <div className="relative z-10 flex items-center text-xs text-muted-foreground bg-surface-2 px-2 py-1 rounded-full border border-border group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
              {categories?.length || 0} دسته اصلی
            </div>
          </TiltSpotlightCard>
        </SlideUp>
      </div>

      {selectedCat && (
        <CategoryModal cat={selectedCat} onClose={() => setSelectedCat(null)} />
      )}

      {showAll && (
        <AllCategoriesModal
          categories={categories as Category[]}
          onClose={() => setShowAll(false)}
        />
      )}
    </>
  );
}
