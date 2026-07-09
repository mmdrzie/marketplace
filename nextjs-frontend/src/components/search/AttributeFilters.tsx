'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/queryKeys';
import { GlassSelect } from '@/components/common/GlassSelect';
import { Attribute } from '@/types';

interface AttributeFiltersProps {
  categorySlug: string | null;
  filters: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export function AttributeFilters({ categorySlug, filters, onChange }: AttributeFiltersProps) {
  const { data: apiAttrs, isError } = useQuery({
    queryKey: queryKeys.attributes.byCategory(categorySlug),
    queryFn: async () => {
      if (!categorySlug) return [];
      const res = await api.get(`/categories/${categorySlug}/attributes`);
      return res.data.data as Attribute[];
    },
    enabled: !!categorySlug,
    retry: 1,
  });

  const attributes = apiAttrs ?? null;

  const filterable = attributes?.filter((a) => a.is_filterable) || [];

  if (!filterable.length) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-foreground">مشخصات فنی</h4>
      {filterable.map((attr: Attribute) => (
        <div key={attr.id}>
          <label className="block text-xs text-muted-foreground mb-1">{attr.label}</label>
          {attr.type === 'select' ? (
            <GlassSelect
              value={filters[attr.name] || ''}
              onChange={(val) => onChange(attr.name, val)}
              options={attr.options?.map((opt: string) => ({ value: opt, label: opt })) || []}
              placeholder="همه"
            />
          ) : attr.type === 'number' ? (
            <div className="grid grid-cols-2 gap-1">
              <input
                type="number"
                placeholder="حداقل"
                value={filters[`min_${attr.name}`] || ''}
                onChange={(e) => onChange(`min_${attr.name}`, e.target.value)}
                className="w-full px-2 py-1.5 bg-surface-2 border border-border-subtle rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <input
                type="number"
                placeholder="حداکثر"
                value={filters[`max_${attr.name}`] || ''}
                onChange={(e) => onChange(`max_${attr.name}`, e.target.value)}
                className="w-full px-2 py-1.5 bg-surface-2 border border-border-subtle rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
