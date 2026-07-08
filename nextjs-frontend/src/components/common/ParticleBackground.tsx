'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  size: number;
  opacity: number;
  phase: number;
  speed: number;
  r: number;
  g: number;
  b: number;
}

const FALLBACK: number[][] = [[61, 48, 36]];

function themeColors(): number[][] {
  try {
    const s = getComputedStyle(document.documentElement);
    const parse = (h: string) => {
      const m = h.match(/#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
    };
    const primary = parse(s.getPropertyValue('--color-primary').trim());
    const muted = parse(s.getPropertyValue('--color-muted-foreground').trim());
    const fg = parse(s.getPropertyValue('--color-foreground').trim());

    if (primary && muted) return [primary, muted, primary];
    if (primary) return [primary, primary, primary];
    if (fg) return [fg, fg, fg];
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export function ParticleBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const partsRef = useRef<Particle[]>([]);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(0);
  const aliveRef = useRef(false);
  const lastMoveTime = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const c = ctx;
    const cnv = canvas;
    const colors = themeColors();

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      cnv.width = w;
      cnv.height = h;
      return { w, h };
    }

    function makeParticles(w: number, h: number) {
      const count = Math.min(Math.floor((w * h) / 20000), 150);
      const out: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const ci = i % colors.length;
        const col = colors[ci];
        out.push({
          x, y, vx: 0, vy: 0, ox: x, oy: y,
          size: 0.4 + Math.random() * 1.5,
          opacity: 0.5 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          speed: 0.3 + Math.random() * 0.7,
          r: col[0], g: col[1], b: col[2],
        });
      }
      return out;
    }

    let dim = resize();
    partsRef.current = makeParticles(dim.w, dim.h);

    const onResize = () => {
      dim = resize();
      partsRef.current = makeParticles(dim.w, dim.h);
    };
    window.addEventListener('resize', onResize);

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime.current < 16) return;
      lastMoveTime.current = now;
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };

    const onClick = (e: MouseEvent) => {
      const parts = partsRef.current;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        if (dx * dx + dy * dy < 150 * 150) {
          const angle = Math.random() * Math.PI * 2;
          const force = 0.3 + Math.random() * 0.5;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);

    aliveRef.current = true;
    const maxDist = Math.min(dim.w, dim.h) * 0.25;

    function loop() {
      if (!aliveRef.current) return;

      const { w, h } = dim;
      const cx = cursorRef.current.x;
      const cy = cursorRef.current.y;
      const parts = partsRef.current;
      const t = performance.now();

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        const driftX = Math.sin(t * 0.0003 * p.speed + p.phase * 1.1) * 0.08;
        const driftY = Math.cos(t * 0.00025 * p.speed + p.phase) * 0.08;

        const ax = p.ox + driftX;
        const ay = p.oy + driftY;

        p.vx += (ax - p.x) * 0.008;
        p.vy += (ay - p.y) * 0.008;

        const dx = p.x - cx;
        const dy = p.y - cy;
        const d2 = dx * dx + dy * dy;
        const radius = 300;
        if (d2 < radius * radius && d2 > 4) {
          const d = Math.sqrt(d2);
          const f = (1 - d / radius) * (1 - d / radius) * 1.5;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * f;
          p.vy -= Math.sin(angle) * f;
        }

        p.vx *= 0.94;
        p.vy *= 0.94;

        p.x += p.vx;
        p.y += p.vy;

        const dxo = p.x - p.ox;
        const dyo = p.y - p.oy;
        const do2 = dxo * dxo + dyo * dyo;
        if (do2 > maxDist * maxDist) {
          const scale = maxDist / Math.sqrt(do2);
          p.x = p.ox + dxo * scale;
          p.y = p.oy + dyo * scale;
        }

        if (p.x < -20) { p.x = w + 20; p.ox = p.x; }
        if (p.x > w + 20) { p.x = -20; p.ox = p.x; }
        if (p.y < -20) { p.y = h + 20; p.oy = p.y; }
        if (p.y > h + 20) { p.y = -20; p.oy = p.y; }
      }

      c.clearRect(0, 0, w, h);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        c.beginPath();
        c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`;
        c.fill();
      }

      animRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none', className)}
    />
  );
}
