'use client';

import type { CatalogCategory } from './CatalogSidebar';

interface Props {
  categories: CatalogCategory[];
  onSelectGroup: (id: number, title: string) => void;
  onSelectType: (id: number, title: string) => void;
}

export function TuningGroupSelector({ categories, onSelectGroup, onSelectType }: Props) {
  return (
    <div className="space-y-6">
      {categories.map((root) => (
        <section key={root.id}>
          <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full" />
            {root.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {root.children?.map((group) => (
              <div
                key={group.id}
                className="glass rounded-2xl border border-border-subtle p-4 hover:border-primary/30 transition-colors"
              >
                <button
                  onClick={() => onSelectGroup(group.id, group.title)}
                  className="w-full flex items-center justify-between gap-2 group"
                >
                  <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors text-right">
                    {group.title}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground bg-surface-2 px-2 py-0.5 rounded-full shrink-0">
                    {(group.part_count || 0).toLocaleString('fa-IR')} قطعه
                  </span>
                </button>

                {group.children && group.children.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {group.children.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => onSelectType(type.id, type.title)}
                        className="text-[11px] font-medium text-muted-foreground bg-surface-2/70 border border-border rounded-full px-2.5 py-1 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors"
                      >
                        {type.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
