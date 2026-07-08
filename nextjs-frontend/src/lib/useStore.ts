import type { StoreApi, UseBoundStore } from 'zustand';

export function useStoreSelector<T, R>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => R,
): R {
  return store(selector);
}
