'use client';

import { useEffect } from 'react';

export function DeviceDetector() {
  useEffect(() => {
    const html = document.documentElement;

    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    html.classList.toggle('touch-device', isTouch);

    const onVisibility = () => {
      html.classList.toggle('page-hidden', document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      html.classList.remove('touch-device', 'page-hidden');
    };
  }, []);

  return null;
}
