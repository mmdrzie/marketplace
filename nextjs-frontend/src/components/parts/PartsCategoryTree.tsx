'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  icon: string;
  children?: Category[];
}

interface Props {
  categories: Category[];
  activeSlug?: string;
  basePath?: string;
}

function TreeNode({ category, activeSlug, basePath }: { category: Category; activeSlug?: string; basePath: string }) {
  const [open, setOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const isActive = activeSlug === category.slug;

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
          isActive ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-2'
        }`}
      >
        {hasChildren && (
          <button onClick={() => setOpen(!open)} className="shrink-0 text-muted-foreground hover:text-foreground">
            <svg className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
        {!hasChildren && <span className="w-3 shrink-0" />}
        <Link href={`${basePath}/${category.slug}`} className="flex-1 truncate">
          {category.name}
        </Link>
      </div>
      {hasChildren && open && (
        <div className="mr-4 border-r border-border/50 pr-2 space-y-0.5 mt-0.5">
          {category.children!.map((child) => (
            <TreeNode key={child.id} category={child} activeSlug={activeSlug} basePath={basePath} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PartsCategoryTree({ categories, activeSlug, basePath = '/parts/categories' }: Props) {
  return (
    <div className="space-y-1">
      <Link
        href="/parts"
        className={`block px-3 py-2 rounded-xl text-sm transition-all ${
          !activeSlug ? 'bg-primary/10 text-primary font-bold' : 'text-foreground hover:bg-surface-2'
        }`}
      >
        همه قطعات
      </Link>
      {categories.map((cat) => (
        <TreeNode key={cat.id} category={cat} activeSlug={activeSlug} basePath={basePath} />
      ))}
    </div>
  );
}
