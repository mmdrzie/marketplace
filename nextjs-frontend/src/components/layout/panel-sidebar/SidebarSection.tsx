interface SidebarSectionProps {
  label: string;
  children: React.ReactNode;
}

export function SidebarSection({ label, children }: SidebarSectionProps) {
  return (
    <div>
      <div className="border-t border-border my-4" />
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">{label}</p>
      {children}
    </div>
  );
}
