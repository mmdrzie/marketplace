'use client';

import { useRef, useState, useEffect } from 'react';

export function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame: number;
    let start: number | null = null;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const duration = 2200;
      const step = (ts: number) => {
        if (!start) start = ts;
        const elapsed = ts - start;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - (1 - t) * (1 - t) * (1 - t);
        setDisplay(Math.floor(ease * value));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
      observer.disconnect();
    }, { rootMargin: '-40px' });
    observer.observe(el);
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); };
  }, [value]);

  return <span ref={ref}>{display.toLocaleString('fa-IR')}{suffix}</span>;
}
