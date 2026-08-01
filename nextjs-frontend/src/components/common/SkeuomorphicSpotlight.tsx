'use client';

import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { useRef, useCallback, useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  lightRadius?: number;
  tiltIntensity?: number;
};

export function SkeuomorphicSpotlight({
  children,
  className = '',
  lightRadius = 220,
  tiltIntensity = 10,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const [hovered, setHovered] = useState(false);

  const spotlight = useMotionTemplate`radial-gradient(${lightRadius}px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 80%)`;

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    mouseX.set(px);
    mouseY.set(py);
    rotY.set(((px / r.width) - 0.5) * -tiltIntensity);
    rotX.set(((py / r.height) - 0.5) * tiltIntensity);
  }, [tiltIntensity]);

  const handleLeave = useCallback(() => {
    rotX.set(0);
    rotY.set(0);
    setHovered(false);
  }, []);

  return (
    <motion.div
      ref={ref}
      style={{ perspective: 800 }}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={{
          rotateX: rotX,
          rotateY: rotY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 h-full w-full"
      >
        {children}
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1]"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: spotlight, borderRadius: 'inherit' }}
      />
    </motion.div>
  );
}
