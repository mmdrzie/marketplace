import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function AuthHeader({ title, subtitle, icon, className }: AuthHeaderProps) {
  return (
    <header className={cn('text-center mb-8', className)}>
      {icon && (
        <div className="mx-auto mb-5 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          {icon}
        </div>
      )}
      <h1 className="text-2xl font-black tracking-tighter text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-2.5 font-light leading-relaxed">{subtitle}</p>}
    </header>
  );
}
