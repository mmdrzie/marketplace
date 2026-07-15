'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useConversation, useSendMessage, useMarkRead } from '@/hooks/useChat';
import { useAuthStore } from '@/store/authStore';
import { useEcho } from '@/providers/EchoProvider';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageSearch } from './MessageSearch';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/common/Toast';
import type { Message } from '@/types';

interface ChatRoomProps {
  conversationId: number;
  onBack?: () => void;
}

interface FilePreview {
  file: File;
  preview: string;
  isImage: boolean;
}

const Icon = ({ d, className = "w-5 h-5" }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICON_PATHS = {
  back: "M15 18l-6-6 6-6",
  search: "M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z",
  attach: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8",
  send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  close: "M18 6L6 18M6 6l12 12",
  box: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  empty_chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
};

export function ChatRoom({ conversationId, onBack }: ChatRoomProps) {
  const { data: conversation, isLoading } = useConversation(conversationId);
  const sendMessage = useSendMessage();
  const markRead = useMarkRead();
  const user = useAuthStore((s) => s.user);
  const { echo } = useEcho();
  const queryClient = useQueryClient();
  
  const [body, setBody] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const initialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const objectUrlsRef = useRef<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const otherUserName = conversation
    ? (conversation.buyer_id === user?.id ? conversation.seller : conversation.buyer)?.name || 'کاربر'
    : 'کاربر';
  const otherUserNameRef = useRef(otherUserName);
  otherUserNameRef.current = otherUserName;

  useEffect(() => {
    if (!conversationId || !echo || initialized.current) return;
    initialized.current = true;

    const channel = echo.private(`App.Models.Conversation.${conversationId}`);

    channel.listen('MessageSent', () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    });

    channel.listen('Typing', () => {
      setTypingUsers((prev) => prev.includes(otherUserNameRef.current) ? prev : [...prev, otherUserNameRef.current]);
      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((u) => u !== otherUserNameRef.current));
      }, 3000);
    });

    return () => {
      try { echo.leave(`App.Models.Conversation.${conversationId}`); } catch {}
      initialized.current = false;
    };
  }, [conversationId, echo, queryClient]);

  useEffect(() => {
    if (conversationId) markRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: FilePreview[] = [];
    for (const file of files) {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      newPreviews.push({ file, preview: url, isImage: file.type.startsWith('image/') });
    }
    setFilePreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
    if (e.target) e.target.value = '';
  }, []);

  const removeFile = useCallback((index: number) => {
    setFilePreviews((prev) => {
      const removed = prev[index];
      const idx = objectUrlsRef.current.indexOf(removed.preview);
      if (idx !== -1) {
        URL.revokeObjectURL(removed.preview);
        objectUrlsRef.current.splice(idx, 1);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  useEffect(() => {
    return () => { for (const url of objectUrlsRef.current) URL.revokeObjectURL(url); };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!body.trim() && filePreviews.length === 0) || sendMessage.isPending) return;
    try {
      await sendMessage.mutateAsync({ conversationId, body });
      setBody('');
      for (const url of objectUrlsRef.current) URL.revokeObjectURL(url);
      objectUrlsRef.current = [];
      setFilePreviews([]);
    } catch {
      toast({ type: 'error', title: 'خطا', message: 'ارسال پیام با مشکل مواجه شد' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <div className="follow-the-leader"><div></div><div></div><div></div><div></div><div></div></div>
        <p className="text-sm font-medium">در حال بارگذاری مکالمه...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
        <Icon d={ICON_PATHS.empty_chat} className="w-12 h-12" />
        <p className="text-sm">مکالمه یافت نشد</p>
      </div>
    );
  }

  const otherUser = conversation.buyer_id === user?.id ? conversation.seller : conversation.buyer;

  return (
    // ساختار فلکس با ارتفاع کامل (h-full) بدون استفاده از Absolute
    <div className="flex flex-col h-full bg-background/20">
      
      {/* هدر چت (فیزیکی و غیرشناور) */}
      <header className="shrink-0 backdrop-blur-xl bg-surface/50 border-b border-border px-4 py-3 flex items-center gap-3 relative z-20">
        {onBack && (
          <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors shrink-0 md:hidden">
            <Icon d={ICON_PATHS.back} className="w-5 h-5" />
          </button>
        )}
        
        <div className="relative">
          {otherUser?.avatar ? (
            <div className="w-10 h-10 rounded-full p-0.5 bg-primary/20">
              <Image src={otherUser.avatar} alt={otherUser.name || 'avatar'} width={40} height={40} className="w-full h-full rounded-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {otherUser?.name?.[0] || '?'}
            </div>
          )}
          <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-background"></span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-sm truncate">{otherUser?.name || 'کاربر'}</p>
          {conversation.listing && (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
              <Icon d={ICON_PATHS.box} className="w-3 h-3 shrink-0" />
              <span className="truncate">{conversation.listing.title}</span>
            </p>
          )}
        </div>

        <button onClick={() => setShowSearch(!showSearch)} className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-surface-2 transition-colors">
          <Icon d={ICON_PATHS.search} className="w-4 h-4" />
        </button>

        {showSearch && (
          <div className="absolute top-full left-0 right-0 mt-2 px-4 z-30">
            <MessageSearch
              messages={(conversation.messages as Message[]) || []}
              onJumpTo={(id) => {
                messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setShowSearch(false);
              }}
              onClose={() => setShowSearch(false)}
            />
          </div>
        )}
      </header>

      {/* بخش پیام‌ها (فقط این بخش اسکرول می‌شود) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 scroll-smooth">
        {(conversation.messages as Message[])?.map((msg) => (
          <div key={msg.id} ref={(el) => { messageRefs.current[msg.id] = el; }}>
            <MessageBubble message={msg} isOwn={msg.sender_id === user?.id} />
          </div>
        ))}
        <TypingIndicator users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* فوتر چت (فیزیکی و غیرشناور) */}
      <footer className="shrink-0 backdrop-blur-xl bg-surface/50 border-t border-border p-3 md:p-4">
        {filePreviews.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-dropdown justify-center">
            {filePreviews.map((fp, i) => (
              <div key={i} className="relative shrink-0 group">
                <div className="w-16 h-16 rounded-xl bg-surface-2 border border-border overflow-hidden">
                  {fp.isImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={fp.preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Icon d={ICON_PATHS.file} className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => removeFile(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Icon d={ICON_PATHS.close} className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="max-w-4xl mx-auto">
          <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" multiple className="hidden" onChange={handleFileSelect} />
          
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-surface-2 transition-colors" title="پیوست فایل">
              <Icon d={ICON_PATHS.attach} className="w-5 h-5" />
            </button>

            <div className="flex-1 relative flex items-center gap-2 bg-surface/60 border border-border-subtle rounded-full pr-4 pl-2 py-1 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="پیام خود را بنویسید..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2"
                maxLength={1000}
              />
            </div>

            <button
              type="submit"
              disabled={(!body.trim() && filePreviews.length === 0) || sendMessage.isPending}
              className={`shrink-0 w-11 h-11 flex items-center justify-center btn btn-primary rounded-full transition-all duration-300 ${
                (!body.trim() && filePreviews.length === 0) || sendMessage.isPending
                  ? 'opacity-40 cursor-not-allowed'
                  : 'hover:shadow-[0_0_20px_-5px_var(--color-primary)] hover:scale-105 active:scale-95'
              }`}
              aria-label="ارسال پیام"
            >
              {sendMessage.isPending ? (
                <div className="follow-the-leader scale-[0.3] -mx-4"><div></div><div></div><div></div><div></div><div></div></div>
              ) : (
                <Icon d={ICON_PATHS.send} className="w-5 h-5 -scale-x-100" />
              )}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}