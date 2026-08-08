'use client';

import { useEffect, useRef } from 'react';

export function MobileParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;
    const cnv = canvas;

    let w: number, h: number, dpr: number;
    let parts: {
      x: number; y: number; ox: number; oy: number;
      vx: number; vy: number; size: number; layer: number;
      opacity: number; tw: number; twSpd: number;
      isStar: boolean; isSparkle: boolean; isLarge: boolean; ci: number;
    }[] = [];
    let raf: number | null = null;
    let running = false;
    let lastT = 0;
    let frame = 0;
    const MAX_LINK = 120;
    const LINE_EVERY = 2;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cnv.width = Math.round(w * dpr);
      cnv.height = Math.round(h * dpr);
      cnv.style.width = w + 'px';
      cnv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      const count = Math.min(Math.max(Math.floor((w * h) / 15000), 30), 75);
      parts = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        const isStar = roll < 0.06;
        const isSparkle = !isStar && roll < 0.16;
        const isLarge = !isStar && !isSparkle && roll < 0.25;
        parts.push({
          x: Math.random() * w, y: Math.random() * h,
          ox: Math.random() * w, oy: Math.random() * h,
          vx: 0, vy: 0,
          size: isSparkle ? 0.4 + Math.random() * 0.6
            : isLarge ? 1.5 + Math.random() * 2
            : (0.7 + Math.random() * 1.8) * (isStar ? 1.5 : 1),
          layer: Math.random() < 0.6 ? 0.25 + Math.random() * 0.3 : 0.55 + Math.random() * 0.35,
          opacity: isSparkle ? 0.35 + Math.random() * 0.4 : isLarge ? 0.3 + Math.random() * 0.3 : 0.2 + Math.random() * 0.5,
          tw: Math.random() * Math.PI * 2,
          twSpd: 0.008 + Math.random() * 0.02,
          isStar, isSparkle, isLarge,
          ci: Math.random() < 0.5 ? 0 : Math.random() < 0.8 ? 1 : 2,
        });
      }
    }

    type RGB = [number, number, number];
    function parseHex(hex: string): RGB | null {
      const m = hex.trim().match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
      if (!m) return null;
      return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    }
    function cols(): string[] {
      const s = getComputedStyle(document.documentElement);
      const dark = document.documentElement.classList.contains('dark');
      const primary = parseHex(s.getPropertyValue('--color-primary'));
      const amber = parseHex(s.getPropertyValue(dark ? '--color-amber-bright' : '--color-amber'));
      const fg = parseHex(s.getPropertyValue('--color-foreground'));
      const out: string[] = [];
      if (primary) out.push(`rgba(${primary[0]},${primary[1]},${primary[2]},`);
      if (amber) out.push(`rgba(${amber[0]},${amber[1]},${amber[2]},`);
      if (fg && fg !== primary && fg !== amber) out.push(`rgba(${fg[0]},${fg[1]},${fg[2]},`);
      return out.length ? out : ['rgba(107,63,34,', 'rgba(180,83,9,', 'rgba(245,185,113,'];
    }

    function loop() {
      if (!running) return;
      if (document.hidden) { raf = requestAnimationFrame(loop); return; }
      const now = performance.now();
      if (lastT === 0) lastT = now;
      const dt = Math.min((now - lastT) / 16.67, 3);
      lastT = now;
      frame++;

      const c = cols();
      const aM = document.documentElement.classList.contains('dark') ? 1.2 : 1.8;
      const lM = document.documentElement.classList.contains('dark') ? 1.3 : 2.2;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const driftX = Math.sin(now * 0.0005 + p.tw) * 25 * p.layer;
        const driftY = Math.cos(now * 0.0004 + p.tw * 1.3) * 20 * p.layer;
        p.vx += (p.ox + driftX - p.x) * 0.006 * dt;
        p.vy += (p.oy + driftY - p.y) * 0.006 * dt;
        p.vx *= 0.9; p.vy *= 0.9;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.tw += p.twSpd * dt;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      ctx.clearRect(0, 0, w, h);

      if (frame % LINE_EVERY === 0) {
        for (let i = 0; i < parts.length; i++) {
          const a = parts[i];
          for (let j = i + 1; j < parts.length; j++) {
            const b = parts[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            const maxD = MAX_LINK * (0.5 + Math.min(a.layer, b.layer) * 0.6);
            if (d2 < maxD * maxD && Math.abs(a.layer - b.layer) < 0.3) {
              const d = Math.sqrt(d2);
              const alpha = (1 - d / maxD) * 0.4 * Math.min(a.layer, b.layer) * lM;
              if (alpha > 0.004) {
                ctx.strokeStyle = c[0] + alpha + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                const mx = (a.x + b.x) / 2;
                const my = (a.y + b.y) / 2;
                const perpx = (b.y - a.y) / d;
                const perpy = (a.x - b.x) / d;
                const curve = Math.min(d * 0.1, 10);
                ctx.moveTo(a.x, a.y);
                ctx.quadraticCurveTo(mx + perpx * curve, my + perpy * curve, b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const tw = 0.5 + 0.5 * Math.sin(p.tw);
        const o = Math.min(p.opacity * tw * aM, 1);
        const col = c[p.ci];

        if (p.isStar && tw > 0.55) {
          const beam = p.size * (2 + 0.6 * tw);
          const glowR = p.size * 6;
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grd.addColorStop(0, col + '0.35)');
          grd.addColorStop(1, col + '0)');
          ctx.fillStyle = grd;
          ctx.globalAlpha = 1;
          ctx.fillRect(p.x - glowR, p.y - glowR, glowR * 2, glowR * 2);

          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.tw * 0.4);
          ctx.globalAlpha = o * 0.8; ctx.fillStyle = col + '1)';
          ctx.fillRect(-beam, -0.4, beam * 2, 0.8);
          ctx.fillRect(-0.4, -beam, 0.8, beam * 2);
          ctx.restore();
        } else if (p.isLarge) {
          const glowR = p.size * 4 * (0.8 + 0.2 * tw);
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          grd.addColorStop(0, col + '0.3)');
          grd.addColorStop(1, col + '0)');
          ctx.fillStyle = grd;
          ctx.globalAlpha = 1;
          ctx.fillRect(p.x - glowR, p.y - glowR, glowR * 2, glowR * 2);

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.globalAlpha = o * 0.9;
          ctx.fillStyle = col + '1)';
          ctx.fill();
        } else {
          if (p.size > 1) {
            const glowR = p.size * 3;
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
            grd.addColorStop(0, col + '0.2)');
            grd.addColorStop(1, col + '0)');
            ctx.fillStyle = grd;
            ctx.globalAlpha = 1;
            ctx.fillRect(p.x - glowR, p.y - glowR, glowR * 2, glowR * 2);
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.globalAlpha = o;
          ctx.fillStyle = col + '1)';
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    }

    function start() { if (running) return; running = true; lastT = 0; frame = 0; raf = requestAnimationFrame(loop); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    init();
    start();

    const onResize = () => { clearTimeout(rt); rt = setTimeout(init, 250); };
    const onVisibility = () => { if (document.hidden) stop(); else start(); };
    let rt: ReturnType<typeof setTimeout>;
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="md:hidden fixed inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
    />
  );
}
