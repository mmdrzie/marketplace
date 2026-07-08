'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALERTS: { icon: ReactNode; text: string; color: string }[] = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    text: 'آگهی‌های ویژه تا ۶ برابر بازدید بیشتری دارند',
    color: 'bg-warning/10 border-warning/20 text-warning',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
    text: 'قیمت پراید در ۳۰ روز گذشته ۸٪ افزایش داشته',
    color: 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    text: '۵ آگهی جدید در دسته خودرو ثبت شده',
    color: 'bg-destructive/10 border-destructive/20 text-destructive',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    text: 'آگهی‌های امروز بیشترین بازدید را دارند',
    color: 'bg-accent-indigo/10 border-accent-indigo/20 text-accent-indigo',
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    text: 'مقایسه قیمت ماشین‌ها قبل از خرید فراموش نشه',
    color: 'bg-success/10 border-success/20 text-success',
  },
];

export function SmartAlert() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % ALERTS.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const alert = ALERTS[index];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-medium ${alert.color}`}
      >
        <span>{alert.icon}</span>
        <span>{alert.text}</span>
      </motion.div>
    </AnimatePresence>
  );
}
