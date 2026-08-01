'use client';

import { useMotionValue } from 'framer-motion';
import { useRef, useCallback } from 'react';

export function useSkeuomorphicMouse() {
  const ref = useRef<HTMLDivElement>(null);
  const shadowStyle = useMotionValue('');
  const glareOpacity = useMotionValue(0);
  const glareAngle = useMotionValue(0);

  const handleMouseMove = useCallback((event: React.MouseEvent | MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = ('clientX' in event ? event.clientX : 0) - cx;
    const dy = ('clientY' in event ? event.clientY : 0) - cy;
    const angle = Math.atan2(dy, dx);
    const maxOffset = 3;
    const detectionRadius = rect.width * 2;
    const dist = Math.min(maxOffset, Math.sqrt(dx * dx + dy * dy) / detectionRadius * maxOffset);
    const sx = -Math.cos(angle) * dist;
    const sy = -Math.sin(angle) * dist;

    shadowStyle.set([
      `${sx * 2.6}px ${sy * 2.6}px 1.5px rgba(0,0,0,0.081)`,
      `${sx * 5.8}px ${sy * 5.8}px 3.4px rgba(0,0,0,0.12)`,
      `${sx * 9.8}px ${sy * 9.8}px 5.6px rgba(0,0,0,0.15)`,
      `${sx * 14.8}px ${sy * 14.8}px 8.5px rgba(0,0,0,0.174)`,
      `${sx * 21.3}px ${sy * 21.3}px 12.3px rgba(0,0,0,0.195)`,
      `${sx * 30.1}px ${sy * 30.1}px 17.4px rgba(0,0,0,0.216)`,
      `${sx * 42.7}px ${sy * 42.7}px 24.6px rgba(0,0,0,0.24)`,
      `${sx * 62.1}px ${sy * 62.1}px 35.8px rgba(0,0,0,0.27)`,
      `${sx * 95.6}px ${sy * 95.6}px 55.1px rgba(0,0,0,0.309)`,
      `${sx * 170}px ${sy * 170}px 98px rgba(0,0,0,0.39)`,
    ].join(', '));

    const gAngle = (Math.atan2(dy, dx) * (180 / Math.PI) + 180) % 360;
    glareAngle.set(gAngle);

    const distance = Math.sqrt(dx * dx + dy * dy);
    const lightRadius = 400;
    const inner = lightRadius / 3;
    const outer = lightRadius * 1.3;
    let opacity = 0;
    if (distance > inner && distance <= outer) {
      opacity = (distance - inner) / (outer - inner);
    } else if (distance > outer) {
      opacity = 1;
    }
    glareOpacity.set(opacity);
  }, []);

  const handleMouseLeave = useCallback(() => {
    shadowStyle.set('');
    glareOpacity.set(0);
    glareAngle.set(0);
  }, []);

  return { ref, shadowStyle, glareOpacity, glareAngle, handleMouseMove, handleMouseLeave };
}
