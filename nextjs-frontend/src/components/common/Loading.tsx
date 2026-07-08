export function Loading({ text = 'در حال بارگذاری...', size = 'md' }: { text?: string; size?: 'sm' | 'md' | 'lg' }) {
  const dotSize = size === 'sm' ? 'follow-the-leader scale-75' : size === 'lg' ? 'follow-the-leader scale-125' : 'follow-the-leader';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={dotSize}>
        <div></div><div></div><div></div><div></div><div></div>
      </div>
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export function LoadingPage({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-background">
      <Loading text={text} />
    </div>
  );
}

export function LoadingFullScreen({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loading text={text} />
    </div>
  );
}

export function LoadingInline({ text = 'در حال بارگذاری...', size = 'sm' }: { text?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Loading text={text} size={size} />
    </div>
  );
}
