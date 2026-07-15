import { describe, it, expect, beforeEach } from 'vitest';
import { useCompareStore, type CompareItem } from './compareStore';

function makeItem(id: number): CompareItem {
  return {
    id: String(id),
    title: `Listing ${id}`,
    slug: `listing-${id}`,
    price: 1000000,
    price_type: 'fixed',
    status: 'active',
    is_featured: false,
    views: 0,
    primary_image: null,
    category_name: 'خودرو',
    category_slug: 'car',
    category_id: 1,
    province_name: null,
    province_id: null,
    city_id: null,
    city_name: null,
    seller_id: '1',
    seller_name: 'user',
    created_at: new Date().toISOString(),
  };
}

describe('compareStore', () => {
  beforeEach(() => {
    useCompareStore.setState({ items: [] });
  });

  it('starts with empty items', () => {
    expect(useCompareStore.getState().items).toEqual([]);
  });

  it('adds an item', () => {
    const item = makeItem(1);
    useCompareStore.getState().addItem(item);
    expect(useCompareStore.getState().items).toHaveLength(1);
  });

  it('prevents duplicate items', () => {
    const item = makeItem(1);
    useCompareStore.getState().addItem(item);
    useCompareStore.getState().addItem(item);
    expect(useCompareStore.getState().items).toHaveLength(1);
  });

  it('limits to 4 items', () => {
    for (let i = 1; i <= 5; i++) {
      useCompareStore.getState().addItem(makeItem(i));
    }
    expect(useCompareStore.getState().items).toHaveLength(4);
  });

  it('removes an item by id', () => {
    useCompareStore.getState().addItem(makeItem(1));
    useCompareStore.getState().addItem(makeItem(2));
    useCompareStore.getState().removeItem('1');
    expect(useCompareStore.getState().items).toHaveLength(1);
    expect(useCompareStore.getState().items[0].id).toBe('2');
  });

  it('hasItem returns correct boolean', () => {
    useCompareStore.getState().addItem(makeItem(1));
    expect(useCompareStore.getState().hasItem('1')).toBe(true);
    expect(useCompareStore.getState().hasItem(99)).toBe(false);
  });

  it('clears all items', () => {
    useCompareStore.getState().addItem(makeItem(1));
    useCompareStore.getState().addItem(makeItem(2));
    useCompareStore.getState().clearAll();
    expect(useCompareStore.getState().items).toEqual([]);
  });
});
