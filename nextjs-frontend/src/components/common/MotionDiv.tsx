import { cn } from '@/lib/utils';
import type { ReactNode, HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function FadeIn({ children, className, ...props }: Props) {
  return (
    <div className={cn('animate-fade-in-up', className)} {...props}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className, ...props }: Props) {
  return (
    <div className={cn('animate-fade-in-up', className)} {...props}>
      {children}
    </div>
  );
}
