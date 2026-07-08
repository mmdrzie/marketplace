'use client';

import { useState } from 'react';
import type { ServiceType } from '@/store/serviceLogStore';
import { SERVICE_TYPE_LABELS } from '@/store/serviceLogStore';

interface ServiceLogFormProps {
  onSubmit: (data: {
    type: ServiceType;
    title: string;
    description: string;
    date: string;
    mileage?: number;
    cost: number;
    workshop?: string;
    documents: { name: string; url: string }[];
  }) => void;
  onCancel: () => void;
}

export function ServiceLogForm({ onSubmit, onCancel }: ServiceLogFormProps) {
  const [type, setType] = useState<ServiceType>('maintenance');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [workshop, setWorkshop] = useState('');
  const [docNames, setDocNames] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onSubmit({
      type,
      title: title.trim(),
      description: description.trim(),
      date,
      mileage: mileage ? Number(mileage) : undefined,
      cost: cost ? Number(cost) : 0,
      workshop: workshop.trim() || undefined,
      documents: docNames.map((name) => ({ name, url: '#' })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">نوع سرویس</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(SERVICE_TYPE_LABELS) as [ServiceType, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                type === key
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-surface-2 border-border-subtle text-muted-foreground hover:border-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">عنوان</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: تعویض روغن موتور"
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">توضیحات</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات تکمیلی..."
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm min-h-[72px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">تاریخ</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="۱۴۰۳/۰۶"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">کارکرد (کیلومتر)</label>
          <input
            type="text"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="اختیاری"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">هزینه (تومان)</label>
          <input
            type="text"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="۰"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">تعمیرگاه</label>
          <input
            type="text"
            value={workshop}
            onChange={(e) => setWorkshop(e.target.value)}
            placeholder="اختیاری"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">مدارک (فاکتور)</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="نام فایل..."
            className="flex-1 px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  setDocNames((prev) => [...prev, input.value.trim()]);
                  input.value = '';
                }
              }
            }}
          />
        </div>
        {docNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {docNames.map((name, i) => (
              <span key={i} className="text-[10px] bg-surface-2 border border-border-subtle px-2 py-0.5 rounded-md text-muted-foreground flex items-center gap-1">
                {name}
                <button type="button" onClick={() => setDocNames((prev) => prev.filter((_, j) => j !== i))} className="hover:text-destructive">
                  <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 btn btn-ghost text-sm">انصراف</button>
        <button type="submit" disabled={!title.trim() || !date} className="flex-1 btn btn-primary text-sm">ثبت سرویس</button>
      </div>
    </form>
  );
}
