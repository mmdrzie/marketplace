'use client';

import { useState, useEffect } from 'react';

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(hover: none) and (pointer: coarse)').matches
      : false,
  );

  useEffect(() => {
    const mq = window.matchMedia('(hover: none) and (pointer: coarse)');
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isTouch;
}
