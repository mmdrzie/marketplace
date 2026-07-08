'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const { body, attachments, created_at: createdAt, is_read: isRead } = message;
  const [imageViewer, setImageViewer] = useState<string | null>(null);

  return (
    <>
      <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'} animate-scale-in`}>
        <div className={`relative max-w-[85%] md:max-w-[70%] rounded-3xl px-4 py-3 shadow-lg transition-all ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-surface-2 text-foreground border border-border rounded-bl-md'
        }`}>
          {attachments && attachments.length > 0 && (
            <div className={`grid gap-1.5 mb-2 ${attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {attachments.filter((a) => a.type === 'image').map((att) => (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => setImageViewer(att.url)}
                  className="rounded-xl overflow-hidden group relative"
                >
                  <img
                    src={att.thumbnail_url || att.url}
                    alt=""
                    className="w-full h-32 md:h-40 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                </button>
              ))}
            </div>
          )}

          {body && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{body}</p>}

          <div className={`flex items-center gap-1.5 mt-1.5 ${isOwn ? 'justify-start' : 'justify-end'}`}>
            <span className={`text-[10px] font-medium ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
              {formatRelativeTime(createdAt)}
            </span>
            {isOwn && (
              <span className="flex-shrink-0">
                {isRead ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 6 9 11 4" />
                    <path d="M16 4l5 5" />
                    <polyline points="13 14 18 9 23 14" />
                    <path d="M8 14l5 5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 6 9 11 4" />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {imageViewer && (
        <div className="fixed inset-0 z-[9999] bg-overlay flex items-center justify-center p-4 animate-fade-in" onClick={() => setImageViewer(null)}>
          <button onClick={() => setImageViewer(null)} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <img src={imageViewer} alt="" className="max-w-full max-h-[90vh] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}