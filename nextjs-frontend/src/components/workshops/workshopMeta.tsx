import type { ReactNode } from 'react';

const ICON_WRENCH = (
  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
);

const ICON_BOLT = <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />;

const ICON_GEAR = (
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </>
);

export interface WorkshopTypeMeta {
  label: string;
  icon: ReactNode;
  text: string;
  bg: string;
  border: string;
  glow: string;
  strip: string;
}

export const WORKSHOP_TYPE_META: Record<string, WorkshopTypeMeta> = {
  mechanic: {
    label: 'تعمیرکار',
    icon: ICON_WRENCH,
    text: 'text-accent-blue',
    bg: 'bg-accent-blue-bg',
    border: 'border-accent-blue-border',
    glow: 'rgba(6, 182, 212, 0.16)',
    strip: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-sky))',
  },
  tuner: {
    label: 'تیونر',
    icon: ICON_BOLT,
    text: 'text-accent-indigo',
    bg: 'bg-accent-indigo-bg',
    border: 'border-accent-indigo-border',
    glow: 'rgba(99, 102, 241, 0.16)',
    strip: 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-purple))',
  },
  both: {
    label: 'تعمیرکار و تیونر',
    icon: ICON_GEAR,
    text: 'text-accent-purple',
    bg: 'bg-accent-purple-bg',
    border: 'border-accent-purple-border',
    glow: 'rgba(139, 92, 246, 0.16)',
    strip: 'linear-gradient(135deg, var(--color-accent-purple), var(--color-accent-indigo))',
  },
};

const FALLBACK_META: WorkshopTypeMeta = {
  label: 'تعمیرگاه',
  icon: ICON_GEAR,
  text: 'text-primary',
  bg: 'bg-primary/10',
  border: 'border-primary/25',
  glow: 'rgba(107, 63, 34, 0.14)',
  strip: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
};

export function workshopTypeMeta(type?: string): WorkshopTypeMeta {
  return WORKSHOP_TYPE_META[type ?? ''] ?? FALLBACK_META;
}

export function WorkshopTypeIcon({ type, className = 'w-4 h-4' }: { type?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {workshopTypeMeta(type).icon}
    </svg>
  );
}
