'use client';

import { useSaveContent, useRemoveBookmark } from '@/hooks/useContents';

export function BookmarkButton({ contentId, isSaved: _isSaved }: { contentId: number; isSaved?: boolean }) {
  const save = useSaveContent();
  const remove = useRemoveBookmark();
  const loading = save.isPending || remove.isPending;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (_isSaved) await remove.mutateAsync(contentId);
    else await save.mutateAsync(contentId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
      title={_isSaved ? 'حذف از ذخیره‌ها' : 'ذخیره'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill={_isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {_isSaved ? 'ذخیره شده' : 'ذخیره'}
    </button>
  );
}