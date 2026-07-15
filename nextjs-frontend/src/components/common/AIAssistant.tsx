'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = { role: 'user' | 'assistant'; text: string };

const RESPONSES: Record<string, string> = {
  'پیکان': 'چند تا پیکان در آگهی‌ها پیدا شد. محدوده قیمت: ۱۵۰ تا ۴۵۰ میلیون تومان. می‌خوای فیلتر خاصی بزنم؟',
  'پراید': 'چند تا پراید موجوده. محدوده قیمت: ۱۰۰ تا ۳۵۰ میلیون تومان. مدل خاصی مد نظرته؟',
  'سمند': 'سمند تو آگهی‌ها هست. محدوده قیمت: ۲۰۰ تا ۶۰۰ میلیون تومان.',
  'زانتیا': 'زانتیا از ۳۰۰ تا ۸۰۰ میلیون تو آگهی‌ها پیدا میشه.',
  'زیر ۵۰۰': 'آگهی‌های زیر ۵۰۰ میلیون: حدود ۲۴ آگهی موجود. می‌خوای دسته‌بندی خاصی ببینم؟',
  'زیر ۳۰۰': '۳۰ آگهی زیر ۳۰۰ میلیون تومان موجوده.',
  'سلام': 'سلام! چطور می‌تونم کمکت کنم؟ کافیه یه ماشین یا بازه قیمت بگی تا برات جستجو کنم.',
  'help': 'میتونم بهت کمک کنم ماشین پیدا کنی! فقط اسم ماشین یا بازه قیمت رو بگو. مثلاً: "پیکان زیر ۵۰۰" یا "پراید ۱۴۰۰"',
};

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', text: 'سلام! اسم ماشین یا بازه قیمت رو بگو تا برات جستجو کنم.' }]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);

    setTimeout(() => {
      const key = Object.keys(RESPONSES).find((k) => text.includes(k));
      const reply = key ? RESPONSES[key] : RESPONSES.help;
      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);

      if (key && key !== 'سلام' && key !== 'help') {
        setTimeout(() => {
          setMessages((prev) => [...prev, { role: 'assistant', text: 'مایل به مشاهده نتایج هستی؟' }]);
        }, 800);
      }
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 md:bottom-6 left-6 z-[70] w-14 h-14 rounded-full bg-gradient-accent text-white shadow-glow-accent flex items-center justify-center hover:scale-110 transition-transform duration-200"
        title="دستیار هوشمند"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-36 md:bottom-24 left-6 z-[70] w-[340px] sm:w-[380px] glass rounded-3xl border border-border-subtle shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                    <path d="M20 12v2a8 8 0 0 1-16 0v-2" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">دستیار هوشمند</p>
                  <p className="text-[10px] text-muted-foreground">جستجوی پیشرفته خودرو</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="px-4 py-4 max-h-[300px] overflow-y-auto space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-accent-blue-bg border border-accent-blue-border text-foreground'
                      : 'bg-surface-2 border border-border-subtle text-foreground'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="مثلاً: پیکان زیر ۵۰۰..."
                  className="flex-1 bg-surface-2 border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/30 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="shrink-0 w-9 h-9 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
