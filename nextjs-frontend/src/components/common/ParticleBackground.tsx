'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type RGB = [number, number, number];

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  size: number;
  layer: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  colorIndex: number;
  spark: number;
  isStar: boolean;
  comet: number;
}

interface Wave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
}

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  colorIndex: number;
}

interface ThemeState {
  dark: boolean;
  palette: RGB[];
  sprites: HTMLCanvasElement[];
  core: string[];
}

const FALLBACK: RGB[] = [[61, 48, 36]];
const SPRITE = 64;
const MAX_LINK = 110;
const REPEL_R = 85;
const ATTRACT_R = 340;
const WAVE_BAND = 28;
const LINK_CURSOR = 120;
const IDLE_MS = 1500;
const COMET_IGNITE_R = 160;
const PARALLAX_X = 10;
const PARALLAX_Y = 14;
const LIGHT_ALPHA = 1.9;
const LIGHT_LINE = 2.4;

function parseHex(hex: string): RGB | null {
  const m = hex.trim().match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function themePalette(isDark: boolean): RGB[] {
  try {
    const s = getComputedStyle(document.documentElement);
    const primary = parseHex(s.getPropertyValue('--color-primary'));
    const amber = parseHex(s.getPropertyValue(isDark ? '--color-amber-bright' : '--color-amber'));
    const fg = parseHex(s.getPropertyValue('--color-foreground'));
    const palette: RGB[] = [];
    if (primary) palette.push(primary);
    if (amber) palette.push(amber);
    if (fg && fg !== primary && fg !== amber) palette.push(fg);
    return palette.length ? palette : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

function makeSprite(color: RGB): HTMLCanvasElement {
  const cnv = document.createElement('canvas');
  cnv.width = cnv.height = SPRITE;
  const c = cnv.getContext('2d');
  if (!c) return cnv;
  const g = c.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
  g.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0.85)`);
  g.addColorStop(0.35, `rgba(${color[0]},${color[1]},${color[2]},0.26)`);
  g.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
  c.fillStyle = g;
  c.fillRect(0, 0, SPRITE, SPRITE);
  return cnv;
}

export function ParticleBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const partsRef = useRef<Particle[]>([]);
  const wavesRef = useRef<Wave[]>([]);
  const embersRef = useRef<Ember[]>([]);
  const cursorRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(0);
  const aliveRef = useRef(false);
  const lastMoveTime = useRef(0);
  const birthTime = useRef(0);
  const scrollRef = useRef(0);
  const idleBlendRef = useRef(0);
  const wasIdleRef = useRef(false);
  const themeRef = useRef<ThemeState>({ dark: false, palette: FALLBACK, sprites: [], core: [] });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const c = ctx;
    const cnv = canvas;

    function refreshTheme() {
      const dark = document.documentElement.classList.contains('dark');
      const palette = themePalette(dark);
      themeRef.current = {
        dark,
        palette,
        sprites: palette.map(makeSprite),
        core: palette.map(([r, g, b]) => `rgba(${r},${g},${b},`),
      };
    }
    refreshTheme();
    const themeObserver = new MutationObserver(refreshTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      cnv.width = Math.round(w * dpr);
      cnv.height = Math.round(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h, dpr };
    }

    function makeParticles(w: number, h: number) {
      const palette = themeRef.current.palette;
      const count = Math.min(Math.max(Math.floor((w * h) / 17000), 40), 170);
      const out: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.random();
        const layer =
          roll < 0.66
            ? 0.18 + Math.random() * 0.3
            : roll < 0.92
              ? 0.5 + Math.random() * 0.25
              : 0.8 + Math.random() * 0.2;
        const cr = Math.random();
        const colorIndex = cr < 0.58 ? 0 : cr < 0.84 ? (palette[1] ? 1 : 0) : palette[2] ? 2 : 0;
        const isStar = Math.random() < 0.08;
        const size = (0.45 + Math.random() * 1.15) * (0.55 + layer * 0.8) * (isStar ? 1.15 : 1);
        out.push({
          x: Math.random() * w,
          y: Math.random() * h,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          size,
          layer,
          opacity: (0.4 + Math.random() * 0.35) * (0.55 + layer * 0.6) * (isStar ? 1.1 : 1),
          twinkleSpeed: (0.8 + Math.random() * 2.2) * (isStar ? 1.5 : 1),
          twinklePhase: Math.random() * Math.PI * 2,
          colorIndex,
          spark: 0,
          isStar,
          comet: 0,
        });
        out[i].ox = out[i].x;
        out[i].oy = out[i].y;
      }
      return out;
    }

    let dim = resize();
    partsRef.current = makeParticles(dim.w, dim.h);
    wavesRef.current = [];
    embersRef.current = [];
    birthTime.current = performance.now();

    const onResize = () => {
      dim = resize();
      partsRef.current = makeParticles(dim.w, dim.h);
      wavesRef.current = [];
    };
    window.addEventListener('resize', onResize);

    const onMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastMoveTime.current < 16) return;
      lastMoveTime.current = now;
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };

    const onLeave = () => {
      cursorRef.current.x = -9999;
      cursorRef.current.y = -9999;
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY || 0;
    };

    const onClick = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const waves = wavesRef.current;
      if (waves.length >= 8) waves.shift();
      waves.push({
        x,
        y,
        radius: 0,
        maxRadius: Math.min(dim.w, dim.h) * 0.5,
        strength: 1,
      });

      const parts = partsRef.current;
      let best = -1;
      let bestD = COMET_IGNITE_R * COMET_IGNITE_R;
      for (let i = 0; i < parts.length; i++) {
        const dx = parts[i].x - x;
        const dy = parts[i].y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestD) {
          bestD = d2;
          best = i;
        }
      }
      if (best >= 0) {
        const p = parts[best];
        const ang = Math.atan2(p.y - y, p.x - x);
        const tang = ang + (Math.random() < 0.5 ? 1 : -1) * (Math.PI / 2);
        const power = 6 + Math.random() * 3;
        p.vx += Math.cos(tang) * power;
        p.vy += Math.sin(tang) * power;
        p.comet = 1;
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const onVisibility = () => {
      if (!document.hidden && aliveRef.current && animRef.current === 0) {
        animRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    aliveRef.current = true;
    const maxDist = Math.min(dim.w, dim.h) * 0.3;
    let lastTime = 0;

    function loop() {
      if (!aliveRef.current) return;

      if (document.hidden) {
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      const { w, h } = dim;
      const cx = cursorRef.current.x;
      const cy = cursorRef.current.y;
      const parts = partsRef.current;
      const waves = wavesRef.current;
      const embers = embersRef.current;
      const theme = themeRef.current;
      const { sprites, core, palette } = theme;
      const lightAlpha = theme.dark ? 1 : LIGHT_ALPHA;
      const lightLine = theme.dark ? 1 : LIGHT_LINE;
      const now = performance.now();

      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;

      const reveal = Math.min((now - birthTime.current) / 1100, 1);
      const easeReveal = 1 - (1 - reveal) * (1 - reveal);

      const windX = Math.sin(now * 0.00008) * 0.45;
      const windY = Math.cos(now * 0.000065) * 0.35;

      const isIdle = now - lastMoveTime.current > IDLE_MS;
      const idleTarget = isIdle ? 1 : 0;
      idleBlendRef.current += (idleTarget - idleBlendRef.current) * Math.min(dt * 0.04, 1);
      const idleBlend = idleBlendRef.current;

      if (wasIdleRef.current && !isIdle && cx > -5000) {
        if (waves.length >= 8) waves.shift();
        waves.push({
          x: cx,
          y: cy,
          radius: 0,
          maxRadius: Math.min(w, h) * 0.35,
          strength: 0.5,
        });
      }
      wasIdleRef.current = isIdle;

      const mouseForceScale = 1 - idleBlend * 0.8;

      for (let i = 0; i < waves.length; i++) {
        waves[i].radius += 3.2 * dt;
      }
      while (waves.length && waves[0].radius > waves[0].maxRadius) waves.shift();

      const emberColor = palette[1] ? 1 : 0;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        const driftScale = 1 - idleBlend * 0.7;
        const driftAmp = (1 + p.layer * 2.4) * driftScale;
        const ax =
          p.ox +
          Math.sin(now * 0.00045 * (1 + p.twinkleSpeed * 0.5) + p.twinklePhase * 1.7) * driftAmp +
          windX;
        const ay =
          p.oy +
          Math.cos(now * 0.0004 * (1 + p.twinkleSpeed * 0.4) + p.twinklePhase) * driftAmp +
          windY;

        p.vx += (ax - p.x) * 0.006 * dt * (0.6 + p.layer);
        p.vy += (ay - p.y) * 0.006 * dt * (0.6 + p.layer);

        const dxp = p.x - cx;
        const dyp = p.y - cy;
        const d2 = dxp * dxp + dyp * dyp;
        if (d2 < REPEL_R * REPEL_R && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / REPEL_R) * (1 - d / REPEL_R) * 3.4 * (0.5 + p.layer) * mouseForceScale;
          p.vx += (dxp / d) * f * dt;
          p.vy += (dyp / d) * f * dt;
        } else if (d2 < ATTRACT_R * ATTRACT_R && d2 > 1) {
          const d = Math.sqrt(d2);
          const f = (1 - d / ATTRACT_R) * 0.09 * (0.5 + p.layer) * mouseForceScale;
          p.vx -= (dxp / d) * f * dt;
          p.vy -= (dyp / d) * f * dt;
        }

        for (let k = 0; k < waves.length; k++) {
          const wave = waves[k];
          const wdx = p.x - wave.x;
          const wdy = p.y - wave.y;
          const wd = Math.sqrt(wdx * wdx + wdy * wdy) || 1;
          const diff = wd - wave.radius;
          if (Math.abs(diff) < WAVE_BAND) {
            const f = (1 - Math.abs(diff) / WAVE_BAND) * wave.strength * 2.4 * dt;
            p.vx += (wdx / wd) * f;
            p.vy += (wdy / wd) * f;
            p.spark = Math.min(p.spark + f * 0.55, 1);
          }
        }

        if (p.comet > 0.02) {
          const speed = Math.hypot(p.vx, p.vy);
          if (speed > 0.6 && embers.length < 120 && Math.random() < 0.85) {
            embers.push({
              x: p.x,
              y: p.y,
              vx: -p.vx * 0.08 + (Math.random() - 0.5) * 0.25,
              vy: -p.vy * 0.08 + (Math.random() - 0.5) * 0.25,
              life: 1,
              maxLife: 1,
              size: p.size * (0.35 + Math.random() * 0.45),
              colorIndex: emberColor,
            });
          }
          p.comet *= Math.pow(0.99, dt);
        }

        p.spark *= Math.pow(0.985, dt);
        p.vx *= Math.pow(0.92, dt);
        p.vy *= Math.pow(0.92, dt);

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const dxo = p.x - p.ox;
        const dyo = p.y - p.oy;
        const do2 = dxo * dxo + dyo * dyo;
        if (do2 > maxDist * maxDist) {
          const scale = maxDist / (Math.sqrt(do2) || 1);
          p.x = p.ox + dxo * scale;
          p.y = p.oy + dyo * scale;
        }

        if (p.x < -24) { p.x = w + 24; p.ox = p.x; }
        if (p.x > w + 24) { p.x = -24; p.ox = p.x; }
        if (p.y < -24) { p.y = h + 24; p.oy = p.y; }
        if (p.y > h + 24) { p.y = -24; p.oy = p.y; }
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vx *= Math.pow(0.94, dt);
        e.vy *= Math.pow(0.94, dt);
        e.life -= 0.02 * dt;
        if (e.life <= 0) embers.splice(i, 1);
      }

      c.clearRect(0, 0, w, h);

      const s = scrollRef.current;
      const scX = Math.cos(s * 0.0006);
      const scY = Math.sin(s * 0.0008);
      const offsetX = parts.map(p => scX * PARALLAX_X * (0.25 + p.layer * 0.7));
      const offsetY = parts.map(p => scY * PARALLAX_Y * (0.35 + p.layer * 0.9));

      const cursorActive = cx > -5000;
      const linkHot = palette[1] ? core[1] : core[0];

      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        const ax = a.x + offsetX[i];
        const ay = a.y + offsetY[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const bx = b.x + offsetX[j];
          const by = b.y + offsetY[j];
          const dx = ax - bx;
          const dy = ay - by;
          const d2 = dx * dx + dy * dy;
          if (d2 < MAX_LINK * MAX_LINK && Math.abs(a.layer - b.layer) < 0.32) {
            const d = Math.sqrt(d2);
            const ignite = (a.spark + b.spark) / 2;
            const alpha =
              ((1 - d / MAX_LINK) *
                0.1 *
                (0.5 + Math.min(a.layer, b.layer)) *
                (1 + ignite * 5) *
                lightLine *
                (1 - idleBlend * 0.85));
            if (alpha > 0.004) {
              c.strokeStyle = ignite > 0.35 ? linkHot : core[0];
              c.globalAlpha = Math.min(alpha, 0.6);
              c.lineWidth = 1;
              const mx = (ax + bx) / 2;
              const my = (ay + by) / 2;
              const perpx = (by - ay) / d;
              const perpy = (ax - bx) / d;
              const curve = Math.min(d * 0.16, 18);
              c.beginPath();
              c.moveTo(ax, ay);
              c.quadraticCurveTo(mx + perpx * curve, my + perpy * curve, bx, by);
              c.stroke();
            }
          }
        }
      }

      if (cursorActive && idleBlend < 0.98) {
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const px = p.x + offsetX[i];
          const py = p.y + offsetY[i];
          const dx = px - cx;
          const dy = py - cy;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_CURSOR * LINK_CURSOR) {
            const alpha =
              ((1 - Math.sqrt(d2) / LINK_CURSOR) *
                0.05 *
                (0.5 + p.layer) *
                lightLine *
                (1 - idleBlend));
            c.strokeStyle = core[0];
            c.globalAlpha = alpha;
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(px, py);
            c.lineTo(cx, cy);
            c.stroke();
          }
        }
      }
      c.globalAlpha = 1;

      for (const e of embers) {
        const t = e.life / e.maxLife;
        const r = e.size * 3.2 * (0.4 + t * 0.6);
        c.globalAlpha = t * 0.75 * lightAlpha;
        c.drawImage(sprites[emberColor], e.x - r, e.y - r, r * 2, r * 2);
      }
      c.globalAlpha = 1;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const px = p.x + offsetX[i];
        const py = p.y + offsetY[i];
        const twIdleAmp = 1 - idleBlend * 0.65;
        const tw = 0.6 + 0.4 * twIdleAmp * Math.sin(now * 0.001 * p.twinkleSpeed + p.twinklePhase);
        const ignite = 1 + p.spark * 0.8 + p.comet * 0.6;
        const oa = Math.min(p.opacity * easeReveal * ignite * lightAlpha * (1 - idleBlend * 0.25), 1);
        const col = core[p.colorIndex];

        const glowR = p.size * 4.2 * (p.spark > 0.15 ? 1.35 : 1) * (1 + p.comet * 0.5);
        c.globalAlpha = oa * (0.3 + 0.25 * tw) * (1 - idleBlend * 0.4);
        c.drawImage(sprites[p.colorIndex], px - glowR, py - glowR, glowR * 2, glowR * 2);

        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 1.1) {
          const len = Math.min(sp * 0.55, 9) * (0.5 + p.layer);
          c.globalAlpha = Math.min(sp / 9, 1) * 0.28 * oa;
          c.strokeStyle = col + '1)';
          c.lineWidth = Math.max(p.size * 0.7, 1);
          c.lineCap = 'round';
          c.beginPath();
          c.moveTo(px - (p.vx / sp) * len, py - (p.vy / sp) * len);
          c.lineTo(px, py);
          c.stroke();
        }

        c.globalAlpha = oa * (0.55 + 0.45 * tw);
        c.fillStyle = col + '1)';

        if (p.isStar && p.spark > 0.05) {
          const beam = p.size * (1.6 + 1.6 * tw);
          c.save();
          c.translate(px, py);
          c.rotate(p.twinklePhase * 0.5);
          c.fillRect(-beam, -0.4, beam * 2, 0.8);
          c.fillRect(-0.4, -beam, 0.8, beam * 2);
          c.restore();
        } else {
          c.beginPath();
          c.arc(px, py, p.size, 0, Math.PI * 2);
          c.fill();
        }

        c.globalAlpha = 1;
      }

      for (let i = 0; i < waves.length; i++) {
        const wave = waves[i];
        const t = 1 - wave.radius / wave.maxRadius;
        c.strokeStyle = core[0] + t * 0.14 + ')';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        c.stroke();
      }

      animRef.current = requestAnimationFrame(loop);
    }

    loop();

    return () => {
      aliveRef.current = false;
      cancelAnimationFrame(animRef.current);
      themeObserver.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none', className)}
    />
  );
}
