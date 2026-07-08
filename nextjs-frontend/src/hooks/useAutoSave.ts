'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

const STORAGE_KEY = 'listing-form-draft';

export function useAutoSave<T extends Record<string, unknown>>(
  data: T,
  onRestore: (data: T) => void,
  key: string = STORAGE_KEY,
) {
  const hasRestored = useRef(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (hasRestored.current) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved) as T;
        onRestore(parsed);
      }
    } catch { /* ignore corrupted data */ }
    hasRestored.current = true;
    setRestored(true);
  }, [key, onRestore]);

  useEffect(() => {
    if (!hasRestored.current) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch { /* storage full or unavailable */ }
    }, 800);
    return () => clearTimeout(timer);
  }, [data, key]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch { /* ignore */ }
  }, [key]);

  return { clearDraft, hasRestored: restored };
}