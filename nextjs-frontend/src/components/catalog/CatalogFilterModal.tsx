'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/common/Modal';
import type { CatalogCategory } from './CatalogSidebar';

interface Props {
  open: boolean;
  onClose: () => void;
  categories: CatalogCategory[];
  activeId: number | null;
  onSelect: (id: number | null) => void;
}

function findGroupOfType(roots: CatalogCategory[], typeId: number): { group: CatalogCategory; root: CatalogCategory } | null {
  for (const root of roots) {
    for (const group of root.children || []) {
      if (group.children?.some((t) => t.id === typeId)) return { group, root };
    }
  }
  return null;
}

export function CatalogFilterModal({ open, onClose, categories, activeId, onSelect }: Props) {
  const [selectedGroup, setSelectedGroup] = useState<CatalogCategory | null>(null);
  const [selectedRoot, setSelectedRoot] = useState<CatalogCategory | null>(null);

  useEffect(() => {
    if (!open) return;
    const loc = activeId !== null ? findGroupOfType(categories, activeId) : null;
    setSelectedGroup(loc ? loc.group : null);
    setSelectedRoot(loc ? loc.root : null);
  }, [open, activeId, categories]);

  const activeGroupId = useMemo(() => {
    if (activeId === null) return null;
    const loc = findGroupOfType(categories, activeId);
    return loc ? loc.group.id : activeId;
  }, [activeId, categories]);

  const totalCount = useMemo(
    () => categories.reduce((sum, r) => sum + (r.part_count || 0), 0),
    [categories],
  );

  const selectAndClose = (id: number | null) => {
    onSelect(id);
    onClose();
  };

  const openGroup = (root: CatalogCategory, group: CatalogCategory) => {
    setSelectedRoot(root);
    setSelectedGroup(group);
  };

  return (
    <Modal open={open} onClose={onClose} title="فیلتر دسته‌بندی" className="max-w-2xl">
      {selectedGroup === null ? (
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
            <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">
              {totalCount.toLocaleString('fa-IR')} قطعه
            </span>
          </button>

          <div className="max-h-[55vh] overflow-y-auto space-y-6 pl-1">
            {categories.map((root) => (
              <section key={root.id}>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {root.title}
                  <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">
                    {(root.part_count || 0).toLocaleString('fa-IR')} قطعه
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(root.children || []).map((group) => (
                    <button
                      key={group.id}
                      onClick={() => openGroup(root, group)}
                      className={cn(
                        'flex items-center justify-between gap-2 px-4 py-3.5 rounded-2xl text-sm font-medium text-right transition-all border group',
                        activeGroupId === group.id
                          ? 'bg-primary/10 text-primary border-primary/30'
                          : 'bg-surface/60 text-foreground border-border-subtle hover:border-primary/30 hover:bg-surface-2/60',
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {activeGroupId === group.id && (
                          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {group.title}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">
                          {(group.part_count || 0).toLocaleString('fa-IR')}
                        </span>
                        <svg className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedGroup(null); setSelectedRoot(null); }}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              بازگشت به دسته‌ها
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-surface/60 border border-border-subtle">
            <div>
              <p className="text-sm font-bold text-foreground">{selectedRoot?.title} ← {selectedGroup.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(selectedGroup.part_count || 0).toLocaleString('fa-IR')} قطعه در این گروه
              </p>
            </div>
            <button
              onClick={() => selectAndClose(selectedGroup.id)}
              className={cn(
                'text-xs font-bold px-3 py-2 rounded-xl transition-colors border shrink-0',
                activeGroupId === selectedGroup.id
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'text-foreground border-border-subtle hover:bg-surface-2/60',
              )}
            >
              همه {selectedGroup.title}
            </button>
          </div>

          <div className="max-h-[55vh] overflow-y-auto pl-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(selectedGroup.children || []).map((type) => {
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
                      {type.title}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full shrink-0">
                      {(type.part_count || 0).toLocaleString('fa-IR')}
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
