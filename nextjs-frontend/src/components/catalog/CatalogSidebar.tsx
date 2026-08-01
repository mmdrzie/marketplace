'use client';

import { cn } from '@/lib/utils';

export interface CatalogCategory {
  id: number;
  catalog_type_id: number;
  parent_id: number | null;
  slug: string;
  title: string;
  title_en?: string;
  description?: string;
  icon?: string;
  sort_order: number;
  path?: string;
  depth?: number;
  part_count?: number;
  children?: CatalogCategory[];
}

interface Props {
  categories: CatalogCategory[];
  activeId: number | null;
  onSelect: (id: number | null) => void;
  showCounts?: boolean;
}

export function CatalogSidebar({ categories, activeId, onSelect, showCounts = true }: Props) {
  return (
    <div className="glass rounded-3xl border border-border-subtle p-4 space-y-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors',
          activeId === null
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-foreground hover:bg-surface-2/60 border border-transparent',
        )}
      >
        <span>همه قطعات</span>
        {showCounts && (
          <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">
            {categories.reduce((sum, r) => sum + (r.part_count || 0), 0).toLocaleString('fa-IR')}
          </span>
        )}
      </button>

      {categories.map((root) => (
        <div key={root.id} className="pt-1">
          <button
            onClick={() => onSelect(root.id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-colors',
              activeId === root.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-foreground hover:bg-surface-2/60 border border-transparent',
            )}
          >
            <span>{root.title}</span>
            {showCounts && (root.part_count || 0) > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full">
                {(root.part_count || 0).toLocaleString('fa-IR')}
              </span>
            )}
          </button>

          {root.children && root.children.length > 0 && (
            <div className="mt-1 space-y-0.5 pr-3 border-r border-border-subtle mr-2">
              {root.children.map((group) => (
                <div key={group.id}>
                  <button
                    onClick={() => onSelect(group.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      activeId === group.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-surface-2/60 hover:text-foreground border border-transparent',
                    )}
                  >
                    <span>{group.title}</span>
                    {showCounts && (group.part_count || 0) > 0 && (
                      <span className="text-[10px] font-medium text-muted-foreground/70 bg-surface-2 px-2 py-0.5 rounded-full">
                        {(group.part_count || 0).toLocaleString('fa-IR')}
                      </span>
                    )}
                  </button>

                  {group.children && group.children.length > 0 && (
                    <div className="mt-0.5 space-y-0.5 pr-3 border-r border-border-subtle mr-2">
                      {group.children.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => onSelect(type.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] transition-colors',
                            activeId === type.id
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-muted-foreground/80 hover:bg-surface-2/60 hover:text-foreground border border-transparent',
                          )}
                        >
                          <span>{type.title}</span>
                          {showCounts && (type.part_count || 0) > 0 && (
                            <span className="text-[10px] font-medium text-muted-foreground/60 bg-surface-2 px-1.5 py-0.5 rounded-full">
                              {(type.part_count || 0).toLocaleString('fa-IR')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
