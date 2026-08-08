'use client';

import { useEffect, useRef, useCallback } from 'react';

interface TiltOptions {
  maxTilt?: number;
  spotlightSize?: number;
  lerp?: number;
  spotlightLerp?: number;
}

export function use3DTilt(options: TiltOptions = {}) {
  const {
    maxTilt = 8,
    spotlightSize = 280,
    lerp = 0.06,
    spotlightLerp = 0.08,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const rotX = useRef(0);
  const rotY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const spotX = useRef(0);
  const spotY = useRef(0);
  const currentSX = useRef(0);
  const currentSY = useRef(0);
  const isHovering = useRef(false);
  const rafId = useRef<number | null>(null);

  const animate = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;

    const inner = el.querySelector('.glass-3d__inner') as HTMLElement;
    const spotlight = el.querySelector('.glass-3d__spotlight') as HTMLElement;

    if (!inner) return;

    // Lerp towards target
    currentX.current += (rotX.current - currentX.current) * lerp;
    currentY.current += (rotY.current - currentY.current) * lerp;
    currentSX.current += (spotX.current - currentSX.current) * spotlightLerp;
    currentSY.current += (spotY.current - currentSY.current) * spotlightLerp;

    // Apply transforms
    inner.style.transform = `rotateX(${currentX.current}deg) rotateY(${currentY.current}deg)`;

    if (spotlight) {
      spotlight.style.background = `radial-gradient(${spotlightSize}px circle at ${currentSX.current}px ${currentSY.current}px, color-mix(in srgb, var(--color-primary) 25%, transparent), transparent 75%)`;
    }

    // Continue animating if needed
    if (isHovering.current || Math.abs(currentX.current) > 0.05 || Math.abs(currentY.current) > 0.05) {
      rafId.current = requestAnimationFrame(animate);
    } else {
      rafId.current = null;
    }
  }, [maxTilt, spotlightSize, lerp, spotlightLerp]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const handleMouseEnter = () => {
      isHovering.current = true;
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    const handleMouseLeave = () => {
      isHovering.current = false;
      rotX.current = 0;
      rotY.current = 0;
      spotX.current = 0;
      spotY.current = 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      rotY.current = ((x - cx) / cx) * maxTilt;
      rotX.current = -((y - cy) / cy) * maxTilt;

      spotX.current = x;
      spotY.current = y;
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mousemove', handleMouseMove);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mousemove', handleMouseMove);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, [animate, maxTilt]);

  return elementRef;
}
