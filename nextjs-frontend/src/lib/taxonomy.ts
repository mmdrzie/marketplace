import api from './api';
import rawData from './taxonomy-data.json';

// ─── Legacy sync API (based on static JSON) ──────────────────

export type TaxonomyCategory = {
  name: string;
  brands: Array<{ name: string; models: string[] }>;
};

export type TaxonomyData = Record<string, TaxonomyCategory>;

const data = rawData as TaxonomyData;

export function getBrandsByCategory(categorySlug?: string): string[] {
  if (!categorySlug) {
    const all = new Set<string>();
    for (const cat of Object.values(data)) {
      for (const b of cat.brands) all.add(b.name);
    }
    return Array.from(all).sort();
  }
  return data[categorySlug]?.brands.map((b) => b.name) || [];
}

export function getModelsByBrand(brand: string, categorySlug?: string): string[] {
  const cats = categorySlug ? [categorySlug] : Object.keys(data);
  for (const slug of cats) {
    const cat = data[slug];
    if (!cat) continue;
    const found = cat.brands.find((b) => b.name === brand);
    if (found) return found.models;
  }
  return [];
}

export { data as taxonomyData };

// ─── Async API-based functions (for new code) ────────────────

export type BrandEntry = { id: number; name: string; slug: string };
export type ModelEntry = { id: number; name: string };
export type VariantEntry = { id: number; name: string };

let brandsCache: BrandEntry[] | null = null;

async function ensureBrands(): Promise<BrandEntry[]> {
  if (brandsCache) return brandsCache;
  const res = await api.get('/v2/vehicles/brands');
  brandsCache = (res.data?.data || res.data || []) as BrandEntry[];
  return brandsCache;
}

export async function fetchBrands(): Promise<BrandEntry[]> {
  return ensureBrands();
}

export async function fetchModels(brandId: number): Promise<ModelEntry[]> {
  const res = await api.get(`/v2/vehicles/brands/${brandId}/models`);
  return (res.data?.data || res.data || []) as ModelEntry[];
}

export async function fetchVariants(modelId: number): Promise<VariantEntry[]> {
  const res = await api.get(`/v2/vehicles/models/${modelId}/variants`);
  return (res.data?.data || res.data || []) as VariantEntry[];
}
