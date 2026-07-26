import { CloseIcon } from '../sidebar-icons';

const ROLE_LABELS: Record<string, string> = {
  admin: 'مدیر سیستم',
  dealer: 'نمایندگی',
  agency: 'نمایشگاه',
  store: 'فروشگاه',
};

const ACCENT_COLORS: Record<string, string> = {
  admin: 'bg-destructive',
  dealer: 'bg-success',
  agency: 'bg-warning',
  store: 'bg-accent-purple',
  dashboard: 'bg-primary',
};

interface SidebarProfileProps {
  name?: string | null;
  role: string;
  businessName?: string | null;
  accentColor?: string;
  onClose: () => void;
}

export function SidebarProfile({ name, role, businessName, accentColor, onClose }: SidebarProfileProps) {
  const bgColor = accentColor || ACCENT_COLORS[role] || 'bg-primary';
  const roleLabel = ROLE_LABELS[role] || 'کاربر';

  return (
    <div className="p-5 border-b border-border">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}>
          {name?.charAt(0) || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground truncate">{name || 'کاربر'}</p>
          <p className="text-xs text-muted-foreground truncate">
            {roleLabel}{businessName ? ` - ${businessName}` : ''}
          </p>
        </div>
        <button onClick={onClose} className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 shrink-0" aria-label="بستن منو" type="button">
          {CloseIcon('h-4 w-4')}
        </button>
      </div>
    </div>
  );
}
