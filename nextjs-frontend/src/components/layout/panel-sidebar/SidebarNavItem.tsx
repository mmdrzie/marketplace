import Link from 'next/link';
import { motion } from 'framer-motion';

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  accentColor: string;
  onClick?: () => void;
  badge?: number;
}

export function SidebarNavItem({ href, label, icon, isActive, accentColor, onClick, badge }: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors group ${
        isActive
          ? 'font-medium'
          : 'text-muted-foreground hover:bg-surface-2/50 hover:text-foreground'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className={`absolute right-0 w-1.5 h-6 rounded-full ${accentColor}`}
          style={{ boxShadow: `0 0 8px 2px var(--color-${accentColor.replace('bg-', '')})` }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
      <span className={`shrink-0 ${isActive ? `text-foreground` : 'text-muted-foreground group-hover:text-foreground'}`}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="bg-destructive text-destructive-foreground text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
