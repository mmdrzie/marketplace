'use client';

import { usePathname } from 'next/navigation';
import { LayoutGroup } from 'framer-motion';
import { SidebarProfile } from './SidebarProfile';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarSection } from './SidebarSection';
import { LogoutIcon } from '../sidebar-icons';
import { useLogoutModal } from '@/store/logoutModalStore';

export interface NavItem {
  href: string;
  label: string;
  icon: (cn?: string) => React.ReactNode;
}

export interface NavSection {
  label: string;
  links: NavItem[];
}

interface PanelSidebarProps {
  navLinks: NavItem[];
  sections?: NavSection[];
  accentColor: string;
  role: string;
  name?: string | null;
  businessName?: string | null;
  unreadMessages?: number;
  unreadNotifications?: number;
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  onLogout?: () => void;
}

export function PanelSidebar({
  navLinks,
  sections = [],
  accentColor,
  role,
  name,
  businessName,
  unreadMessages,
  unreadNotifications,
  isOpen = false,
  onClose,
  children,
  onLogout,
}: PanelSidebarProps) {
  const pathname = usePathname();
  const openLogoutModal = useLogoutModal((s) => s.open);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = () => {
    onLogout?.();
    openLogoutModal(() => {});
  };

  return (
    <aside className={`fixed md:sticky top-0 md:h-screen inset-y-0 right-0 z-40 w-72 max-w-[85vw] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
      <div className="h-full glass rounded-l-3xl border-l border-border flex flex-col">
        <SidebarProfile
          name={name}
          role={role}
          businessName={businessName}
          accentColor={accentColor}
          onClose={() => {}}
        />

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <LayoutGroup>
            <SidebarSection label="منوی اصلی">
              {navLinks.map((link) => (
                <SidebarNavItem
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon('h-4 w-4')}
                  isActive={isActive(link.href)}
                  accentColor={accentColor}
                />
              ))}
            </SidebarSection>

            {sections.map((section) => (
              <SidebarSection key={section.label} label={section.label}>
                {section.links.map((link) => (
                  <SidebarNavItem
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={link.icon('h-4 w-4')}
                    isActive={isActive(link.href)}
                    accentColor={accentColor}
                    badge={link.href === '/dashboard/messages' ? unreadMessages : link.href === '/dashboard/notifications' ? unreadNotifications : undefined}
                  />
                ))}
              </SidebarSection>
            ))}

            {children}
          </LayoutGroup>
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/5 transition-colors"
          >
            {LogoutIcon('h-4 w-4')}
            خروج از حساب
          </button>
        </div>
      </div>
    </aside>
  );
}
