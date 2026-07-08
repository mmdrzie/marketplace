'use client';

export function TypingIndicator({ users }: { users?: string[] }) {
  if (!users || users.length === 0) return null;
  const label = users.length === 1 ? `${users[0]} ...` : `${users.length} ...`;
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{label}</span>
    </div>
  );
}
