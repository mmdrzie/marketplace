'use client';

import { useState } from 'react';
import { toast } from '@/components/common/Toast';

interface BidFormProps {
  onSubmit: (data: { amount: number; description: string }) => void;
  onCancel: () => void;
}

export function BidForm({ onSubmit, onCancel }: BidFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      toast({ type: 'error', title: 'لطفاً مبلغ پیشنهاد را وارد کنید' });
      return;
    }
    onSubmit({ amount: Number(amount), description: description.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">مبلغ پیشنهاد (تومان)</label>
        <input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مثال: ۴۵۰۰۰۰۰۰۰"
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">توضیحات پیشنهاد</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="مشخصات ماشین‌آلات، مدت زمان، شرایط..."
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 btn btn-ghost text-sm">انصراف</button>
        <button type="submit" className="flex-1 btn btn-primary text-sm">ثبت پیشنهاد</button>
      </div>
    </form>
  );
}
