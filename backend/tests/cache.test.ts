import { describe, it, expect, vi } from 'vitest';
import { MemoryCache } from '../src/services/cache';

describe('MemoryCache', () => {
  it('stores and retrieves values', () => {
    const cache = new MemoryCache();
    cache.set('key1', { foo: 'bar' });
    expect(cache.get('key1')).toEqual({ foo: 'bar' });
  });

  it('returns undefined for missing key', () => {
    const cache = new MemoryCache();
    expect(cache.get('nonexistent')).toBeUndefined();
  });

  it('respects TTL', async () => {
    vi.useFakeTimers();
    const cache = new MemoryCache(100);
    cache.set('key2', 'value', 100);
    expect(cache.get('key2')).toBe('value');
    vi.advanceTimersByTime(150);
    expect(cache.get('key2')).toBeUndefined();
    vi.useRealTimers();
  });

  it('invalidates specific key', () => {
    const cache = new MemoryCache();
    cache.set('key3', 'value');
    cache.invalidate('key3');
    expect(cache.get('key3')).toBeUndefined();
  });

  it('clears all entries', () => {
    const cache = new MemoryCache();
    cache.set('a', 1);
    cache.set('b', 2);
    cache.clear();
    expect(cache.size).toBe(0);
  });

  it('invalidates by pattern', () => {
    const cache = new MemoryCache();
    cache.set('listing:1', 'a');
    cache.set('listing:2', 'b');
    cache.set('user:1', 'c');
    cache.invalidatePattern('listing:');
    expect(cache.get('listing:1')).toBeUndefined();
    expect(cache.get('listing:2')).toBeUndefined();
    expect(cache.get('user:1')).toBe('c');
  });
});
