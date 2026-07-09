'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useTenderStore, TENDER_TYPE_LABELS } from '@/store/tenderStore';
import type { TenderType } from '@/store/tenderStore';
import { GlassSelect } from '@/components/common/GlassSelect';
import { toast } from '@/components/common/Toast';

const PROVINCES = [
  { id: 1, name: 'آذربایجان شرقی' }, { id: 2, name: 'آذربایجان غربی' }, { id: 3, name: 'اردبیل' },
  { id: 4, name: 'اصفهان' }, { id: 5, name: 'البرز' }, { id: 6, name: 'ایلام' },
  { id: 7, name: 'بوشهر' }, { id: 8, name: 'تهران' }, { id: 9, name: 'چهارمحال بختیاری' },
  { id: 10, name: 'خراسان جنوبی' }, { id: 11, name: 'خراسان رضوی' }, { id: 12, name: 'خراسان شمالی' },
  { id: 13, name: 'خوزستان' }, { id: 14, name: 'زنجان' }, { id: 15, name: 'سمنان' },
  { id: 16, name: 'سیستان بلوچستان' }, { id: 17, name: 'فارس' }, { id: 18, name: 'قزوین' },
  { id: 19, name: 'قم' }, { id: 20, name: 'کردستان' }, { id: 21, name: 'کرمان' },
  { id: 22, name: 'کرمانشاه' }, { id: 23, name: 'کهگیلویه و بویراحمد' }, { id: 24, name: 'گلستان' },
  { id: 25, name: 'گیلان' }, { id: 26, name: 'لرستان' }, { id: 27, name: 'مازندران' },
  { id: 28, name: 'مرکزی' }, { id: 29, name: 'هرمزگان' }, { id: 30, name: 'همدان' },
  { id: 31, name: 'یزد' },
];

const MACHINE_TYPES = ['بیل مکانیکی', 'لودر', 'بولدوزر', 'جرثقیل', 'کامیون کمپرسی', 'تراکتور', 'گرییدر', 'غلتک', 'فینیشر', 'دکل حفاری', 'تاور کرین', 'سایر'];

export function TenderForm() {
  const router = useRouter();
  const { user } = useAuthStore();
  const createTender = useTenderStore((s) => s.createTender);

  const [type, setType] = useState<TenderType>('rental');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [machineType, setMachineType] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [duration, setDuration] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !machineType || !provinceId || !deadline) {
      toast({ type: 'error', title: 'لطفاً فیلدهای ضروری را پر کنید' });
      return;
    }
    const province = PROVINCES.find((p) => String(p.id) === provinceId);
    createTender({
      userId: user?.id || 1,
      userName: user?.name || 'کاربر',
      title: title.trim(),
      description: description.trim(),
      machineType,
      quantity: Number(quantity) || 1,
      duration: type === 'purchase' ? '—' : duration,
      budgetMin: Number(budgetMin) || 0,
      budgetMax: Number(budgetMax) || 0,
      provinceId: Number(provinceId),
      provinceName: province?.name || '',
      type,
      deadline: new Date(deadline).toISOString(),
    });
    toast({ type: 'success', title: 'درخواست شما ثبت شد' });
    router.push('/tenders');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">نوع درخواست</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(TENDER_TYPE_LABELS) as [TenderType, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setType(key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                type === key ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-2 border-border-subtle text-muted-foreground hover:border-border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">عنوان درخواست</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: اجاره بیل مکانیکی برای پروژه سد"
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground mb-1.5">توضیحات</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="شرح کامل نیازمندی‌ها..."
          className="w-full px-4 py-2.5 glass-input rounded-xl text-sm min-h-[96px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">نوع ماشین‌آلات</label>
          <GlassSelect
            value={machineType}
            onChange={setMachineType}
            options={MACHINE_TYPES.map((m) => ({ value: m, label: m }))}
            placeholder="انتخاب کنید"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">تعداد</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground"
          />
        </div>
      </div>

      {type !== 'purchase' && (
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">مدت زمان</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="مثال: ۳ ماه"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">بودجه حداقل</label>
          <input
            type="text"
            value={budgetMin}
            onChange={(e) => setBudgetMin(e.target.value)}
            placeholder="تومان"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">بودجه حداکثر</label>
          <input
            type="text"
            value={budgetMax}
            onChange={(e) => setBudgetMax(e.target.value)}
            placeholder="تومان"
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">استان</label>
          <GlassSelect
            value={provinceId}
            onChange={setProvinceId}
            options={PROVINCES.map((p) => ({ value: String(p.id), label: p.name }))}
            placeholder="انتخاب کنید"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted-foreground mb-1.5">مهلت پیشنهاد</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all text-foreground"
            required
          />
        </div>
      </div>

      <button type="submit" className="w-full btn btn-primary text-sm">ثبت درخواست</button>
    </form>
  );
}
