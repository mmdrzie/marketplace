'use client';

import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import Link from 'next/link';

export function TiltSpotlightCard({ children, href, onClick }: { children: React.ReactNode; href?: string; onClick?: () => void }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const shadowStr = useMotionValue('');

  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 80%)`;

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    mouseX.set(px);
    mouseY.set(py);
    rotY.set(((px / r.width) - 0.5) * -10);
    rotX.set(((py / r.height) - 0.5) * 10);

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const angle = Math.atan2(dy, dx);
    const maxOffset = 2;
    const detectionRadius = r.width * 1.5;
    const dist = Math.min(maxOffset, Math.sqrt(dx * dx + dy * dy) / detectionRadius * maxOffset);
    const sx = -Math.cos(angle) * dist;
    const sy = -Math.sin(angle) * dist;

    shadowStr.set([
      `${sx * 3}px ${sy * 3}px 2px rgba(0,0,0,0.06)`,
      `${sx * 7}px ${sy * 7}px 4px rgba(0,0,0,0.09)`,
      `${sx * 12}px ${sy * 12}px 7px rgba(0,0,0,0.12)`,
      `${sx * 20}px ${sy * 20}px 12px rgba(0,0,0,0.15)`,
    ].join(', '));
  };

  return (
    <motion.div style={{ perspective: 800 }} className="h-full overflow-hidden rounded-2xl">
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', boxShadow: shadowStr }}
        className="h-full"
      >
        {href ? (
          <Link
            href={href}
            onMouseMove={handleMove}
            onMouseLeave={() => { rotX.set(0); rotY.set(0); shadowStr.set(''); }}
            className="group relative bg-surface/40 border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-surface transition-colors duration-300 h-full overflow-hidden"
          >
            <motion.div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: spotlight }} />
            <div style={{ transform: 'translateZ(30px)' }} className="flex flex-col items-center">
              {children}
            </div>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onClick}
            onMouseMove={handleMove}
            onMouseLeave={() => { rotX.set(0); rotY.set(0); shadowStr.set(''); }}
            className="group relative bg-surface/40 border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-surface transition-colors duration-300 h-full w-full cursor-pointer"
          >
            <motion.div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: spotlight }} />
            <div style={{ transform: 'translateZ(30px)' }} className="flex flex-col items-center">
              {children}
            </div>
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
