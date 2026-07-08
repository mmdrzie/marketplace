'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TradeInWidgetProps {
  className?: string;
}

const BRANDS = ['پراید', 'پژو', 'سمند', 'رانا', 'دنا', 'تیبا', 'ساینا', 'کوییک', 'شاهین', 'هایما'];

export function TradeInWidget({ className }: TradeInWidgetProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [brand, setBrand] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');

  const handleSubmit = () => {
    setStep(3);
    setTimeout(() => { setOpen(false); setStep(1); setBrand(''); setYear(''); setMileage(''); }, 3000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn('w-full btn btn-glass', className)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 2a4 4 0 01-4 4H5a1 1 0 00-1 1v0a1 1 0 001 1h0M11 2v12M11 2h8l3 4-3 4h-8" /></svg>
        پیشنهاد معاوضه
      </button>

      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-overlay" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-surface rounded-3xl p-6 w-full max-w-md shadow-glow-accent border border-border"
            >
              {step === 1 && (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                    <h3 className="text-lg font-bold text-foreground">معاوضه خودرو</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">اطلاعات ماشین خودت رو وارد کن تا فروشنده بررسی کنه</p>
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">برند ماشین شما</label>
                      <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full bg-surface-2 border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary/30">
                        <option value="">انتخاب کنید</option>
                        {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">سال ساخت</label>
                      <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="مثلاً ۱۴۰۰" className="w-full bg-surface-2 border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary/30" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">کارکرد (کیلومتر)</label>
                      <input type="text" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="مثلاً ۵۰۰۰۰" className="w-full bg-surface-2 border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary/30" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setOpen(false)} className="flex-1 py-2.5 btn btn-ghost text-xs">انصراف</button>
                    <button onClick={() => setStep(2)} disabled={!brand || !year || !mileage} className="flex-1 py-2.5 btn btn-primary text-xs disabled:opacity-40">ارسال پیشنهاد</button>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="text-center py-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-blue mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  <h3 className="text-lg font-bold text-foreground mb-2">پیشنهاد شما ارسال شد</h3>
                  <p className="text-xs text-muted-foreground mb-6">فروشنده پیشنهاد معاوضه شما را بررسی خواهد کرد</p>
                  {[
                    { label: 'ماشین شما', value: `${brand} - ${year} - ${mileage} کیلومتر` },
                  ].map((i) => (
                    <div key={i.label} className="flex justify-between text-xs py-2 border-b border-border">
                      <span className="text-muted-foreground">{i.label}</span>
                      <span className="font-medium text-foreground">{i.value}</span>
                    </div>
                  ))}
                  <button onClick={() => { setOpen(false); setStep(1); }} className="mt-6 btn btn-primary text-xs">بستن</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
