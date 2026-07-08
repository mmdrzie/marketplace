'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export function CustomCursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const handRef = useRef<HTMLSpanElement>(null);
  const pos = useRef({ x: -9999, y: -9999 });
  const target = useRef({ x: -9999, y: -9999 });
  const raf = useRef(0);
  const shown = useRef(false);
  const isHover = useRef(false);
  const lastHoverCheck = useRef(0);
  const loopActive = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const style = document.createElement('style');
    style.textContent = '* { cursor: none !important; }';
    document.head.appendChild(style);

    const show = () => {
      if (shown.current) return;
      shown.current = true;
      if (containerRef.current) containerRef.current.style.opacity = '1';
    };

    const onMove = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!shown.current) {
        pos.current.x = e.clientX;
        pos.current.y = e.clientY;
      }
      show();

      const now = performance.now();
      if (now - lastHoverCheck.current < 50) return;
      lastHoverCheck.current = now;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const clickable = el?.closest('a, button, input, select, textarea, [role="button"], [onclick]');
      isHover.current = !!clickable;
    };

    const onLeave = () => {
      if (containerRef.current) containerRef.current.style.opacity = '0';
    };

    const onEnter = () => {
      if (containerRef.current) containerRef.current.style.opacity = '1';
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    const loop = () => {
      if (!shown.current && !loopActive.current) return;

      pos.current.x += (target.current.x - pos.current.x) * 0.6;
      pos.current.y += (target.current.y - pos.current.y) * 0.6;

      if (containerRef.current) {
        const offset = isHover.current ? 0 : 3;
        containerRef.current.style.transform = `translate(${pos.current.x - offset}px, ${pos.current.y - offset}px)`;
      }

      if (dotRef.current) {
        dotRef.current.style.display = isHover.current ? 'none' : '';
      }
      if (handRef.current) {
        handRef.current.style.display = isHover.current ? '' : 'none';
      }

      raf.current = requestAnimationFrame(loop);
    };

    loopActive.current = true;
    loop();

    return () => {
      style.remove();
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      cancelAnimationFrame(raf.current);
      loopActive.current = false;
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999] opacity-0 transition-opacity duration-200"
      style={{ isolation: 'isolate' }}
    >
      <div
        ref={dotRef}
        className="w-[6px] h-[6px] rounded-full bg-primary"
      />
      <span ref={handRef} className="text-primary">
        <svg viewBox="0 0 12 18" fill="currentColor" width="14" height="20">
          <path d="M0.5 0.5 L11 10.5 L6.5 10.5 L4 15 L2.5 10.5 Z" />
        </svg>
      </span>
    </div>,
    document.body
  );
}