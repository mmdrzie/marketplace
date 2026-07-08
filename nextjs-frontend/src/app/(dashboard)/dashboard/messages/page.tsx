'use client';

import { useState } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { ChatRoom } from '@/components/chat/ChatRoom';

const Icon = ({ d, className = "w-5 h-5" }: { d: string; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICON_PATHS = {
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  back: "M15 18l-6-6 6-6",
  empty_chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
};

export default function MessagesPage() {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden flex flex-col">
      {/* پس‌زمینه داینامیک معماری */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] text-foreground" style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)', backgroundSize: '64px 64px' }} />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[130px] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 py-12 md:py-16 flex-1 flex flex-col">
        
        {/* هدر صفحه */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 border border-border bg-surface/40 px-4 py-1.5 rounded-full text-xs text-muted-foreground mb-4 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              MESSAGES
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-foreground">صندوق پیام‌ها</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base font-light">مکالمات خود را به صورت امن مدیریت کنید.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 btn btn-primary rounded-xl text-xs font-medium shrink-0">
            <Icon d={ICON_PATHS.edit} className="w-4 h-4" />
            پیام جدید
          </button>
        </div>

        {/* بدنه چت دو ستونه (Split View) */}
        <div className="flex-1 h-[calc(100vh-16rem)] glass rounded-3xl border border-border overflow-hidden flex flex-col md:flex-row">
          
          {/* ستون لیست (راست) */}
          <div className={`w-full md:w-80 lg:w-96 border-l border-border flex flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">مکالمات</h3>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-dropdown">
              <ConversationList onSelectChat={(id) => setActiveChatId(id)} activeChatId={activeChatId} />
            </div>
          </div>

          {/* ستون چت (چپ) */}
          <div className={`flex-1 ${activeChatId ? 'flex' : 'hidden md:flex'} flex-col`}>
            {activeChatId ? (
              <ChatRoom conversationId={activeChatId} onBack={() => setActiveChatId(null)} />
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Icon d={ICON_PATHS.empty_chat} className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">یک مکالمه را انتخاب کنید</h2>
                <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">برای شروع گفتگو، یک مکالمه از لیست انتخاب کنید.</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}