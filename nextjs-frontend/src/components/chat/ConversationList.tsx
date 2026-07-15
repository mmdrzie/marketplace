'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useConversations } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useEcho } from '@/providers/EchoProvider';
import { useQueryClient } from '@tanstack/react-query';
import { formatRelativeTime } from '@/lib/utils';
import type { Conversation } from '@/types';

interface ConversationListProps {
  onSelectChat: (id: number) => void;
  activeChatId?: number | null;
}

export function ConversationList({ onSelectChat, activeChatId }: ConversationListProps) {
  const { data, isLoading } = useConversations();
  const user = useAuthStore((s) => s.user);
  const { echo } = useEcho();
  const queryClient = useQueryClient();
  const subscribed = useRef<Set<number>>(new Set());
  const idsSnapshot = useRef<string>('[]');

  useEffect(() => {
    if (!echo || !user) return;
    const active = subscribed.current;
    const newIds = new Set((data as Conversation[] | undefined)?.map((c) => c.id) || []);
    const prevIds: number[] = JSON.parse(idsSnapshot.current);

    const same = prevIds.length === newIds.size && prevIds.every((id) => newIds.has(id));
    if (same) return;

    for (const id of prevIds) {
      if (!newIds.has(id)) {
        active.delete(id);
        try { echo.leave(`App.Models.Conversation.${id}`); } catch {}
      }
    }
    for (const id of newIds) {
      if (active.has(id)) continue;
      active.add(id);
      const channelName = `App.Models.Conversation.${id}`;
      try {
        const channel = echo.private(channelName);
        channel.listen('MessageSent', () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        });
      } catch {}
    }
    idsSnapshot.current = JSON.stringify(Array.from(newIds));
  }, [echo, user, data, queryClient]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 motion-safe:animate-pulse">
            <div className="w-12 h-12 bg-surface-2 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 bg-surface-2 rounded"></div>
              <div className="h-2 w-3/4 bg-surface-2/70 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const conversations = data || [];

  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
        <div className="w-20 h-20 rounded-3xl bg-surface-2 border border-border flex items-center justify-center text-primary mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="font-bold text-foreground text-lg mb-2">مکالمه‌ای ندارید</p>
        <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed">
          روی دکمه ارسال پیام در صفحه آگهی‌ها کلیک کنید تا مکالمه شما در اینجا نمایش داده شود.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-1">
      {(conversations as Conversation[]).map((conv) => {
        const otherUser = conv.buyer_id === user?.id ? conv.seller : conv.buyer;
        const hasAttachments = conv.last_message?.attachments && conv.last_message.attachments.length > 0;
        const isActive = activeChatId === conv.id;
        
        return (
          <button
            key={conv.id}
            onClick={() => onSelectChat(conv.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 group text-right ${
              isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-surface-2/50 border border-transparent'
            }`}
          >
            <div className="relative shrink-0">
              {otherUser?.avatar ? (
                <Image src={otherUser.avatar} alt={otherUser.name || 'avatar'} width={48} height={48} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface-2 border-2 border-border flex items-center justify-center text-lg font-bold text-foreground">
                  {otherUser?.name?.[0] || '?'}
                </div>
              )}
              <span className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-background"></span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className={`font-bold text-sm truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {otherUser?.name || 'کاربر'}
                </p>
                <span className="text-[10px] text-muted-foreground shrink-0 bg-surface-2 px-2 py-0.5 rounded-full font-medium">
                  {formatRelativeTime(conv.last_message_at)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasAttachments && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                )}
                <p className="text-xs text-muted-foreground truncate">
                  {hasAttachments ? 'پیوست' : (conv.last_message?.body || conv.listing?.title || 'بدون پیام اخیر')}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}