'use client';
import { useRef, useEffect, useState, type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
  rootMargin?: string;
}

function useInView(rootMargin = '-50px') {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);
  return { ref, visible };
}

export function SlideUp({ children, className, delay = 0, rootMargin = '-50px', ...props }: Props) {
  const { ref, visible } = useInView(rootMargin);
  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ScaleIn({ children, className, delay = 0, rootMargin = '-50px', ...props }: Props) {
  const { ref, visible } = useInView(rootMargin);
  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.9)',
        transition: `opacity 0.3s ease-out ${delay}s, transform 0.3s ease-out ${delay}s`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({ children, className, ...props }: Props) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={cn(className)}
      data-visible={visible}
      {...props}
    >
      {children}
    </div>
  );
}
