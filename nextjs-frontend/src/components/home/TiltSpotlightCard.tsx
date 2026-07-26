'use client';

import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import Link from 'next/link';

export function TiltSpotlightCard({ children, href }: { children: React.ReactNode; href: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${mouseX}px ${mouseY}px, color-mix(in srgb, var(--color-primary) 16%, transparent), transparent 80%)`;

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    mouseX.set(px);
    mouseY.set(py);
    rotY.set(((px / r.width) - 0.5) * -10);
    rotX.set(((py / r.height) - 0.5) * 10);
  };

  return (
    <motion.div style={{ perspective: 800 }} className="h-full">
      <motion.div style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }} className="h-full">
        <Link
          href={href}
          onMouseMove={handleMove}
          onMouseLeave={() => { rotX.set(0); rotY.set(0); }}
          className="group relative bg-surface/40 border border-border rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-surface transition-colors duration-300 h-full overflow-hidden"
        >
          <motion.div className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: spotlight }} />
          <div style={{ transform: 'translateZ(30px)' }} className="flex flex-col items-center">
            {children}
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
