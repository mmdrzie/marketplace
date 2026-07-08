'use client';

import { useState } from 'react';

interface ChatInputProps {
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || disabled) return;
    await onSend(body);
    setBody('');
  };

  const isButtonDisabled = !body.trim() || disabled;

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
      {/* فیلد ورودی پیام با دکمه پیوست داخل آن */}
      <div className="relative flex-1">
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="پیام خود را بنویسید..."
          className="w-full pr-12 pl-5 py-3.5 glass-input rounded-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-300"
          maxLength={1000}
          disabled={disabled}
        />
        
        {/* دکمه پیوست فایل (فقط بصری، در صورت نیاز می‌توانید منطق آن را اضافه کنید) */}
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
          title="پیوست فایل"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
      </div>

      {/* دکمه ارسال دایره‌ای و شناور */}
      <button
        type="submit"
        disabled={isButtonDisabled}
        className={`flex-shrink-0 w-12 h-12 flex items-center justify-center btn btn-primary rounded-full transition-all duration-300 ${
          isButtonDisabled 
            ? 'opacity-40 cursor-not-allowed' 
            : 'hover:shadow-glow-primary hover:scale-105 active:scale-95'
        }`}
        aria-label="ارسال پیام"
      >
        {/* آیکون هواپیما (Paper Plane) با جهت دهی به سمت چپ برای RTL */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 -scale-x-100" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </form>
  );
}