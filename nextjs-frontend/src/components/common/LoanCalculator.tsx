'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MiniDonut } from './Charts';

interface LoanCalculatorProps {
  className?: string;
  defaultPrice?: number;
}

export function LoanCalculator({ className, defaultPrice }: LoanCalculatorProps) {
  const [price, setPrice] = useState(defaultPrice || 500000000);
  const [downPaymentPct, setDownPaymentPct] = useState(30);
  const [interestRate, setInterestRate] = useState(18);
  const [duration, setDuration] = useState(24);

  const downPayment = Math.round(price * (downPaymentPct / 100));
  const loanAmount = price - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayment = monthlyRate === 0
    ? loanAmount / duration
    : Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / (Math.pow(1 + monthlyRate, duration) - 1));
  const totalPayment = monthlyPayment * duration;
  const totalInterest = totalPayment - loanAmount;

  const format = (n: number) => n.toLocaleString('fa-IR');

  return (
    <div className={cn('glass rounded-3xl p-6 md:p-8 border border-border-subtle', className)}>
      <div className="flex items-center gap-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <h3 className="text-base font-black text-foreground">محاسبه اقساط</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <SliderField label="قیمت خودرو" value={price} onChange={setPrice} min={50000000} max={2000000000} step={5000000} format={format} />
          <SliderField label="پیش پرداخت" value={downPaymentPct} onChange={setDownPaymentPct} min={0} max={70} step={5} suffix="%" />
          <SliderField label="نرخ سود سالانه" value={interestRate} onChange={setInterestRate} min={0} max={36} step={1} suffix="%" />
          <SliderField label="مدت بازپرداخت" value={duration} onChange={setDuration} min={6} max={72} step={6} format={(n) => `${n} ماهه`} />
        </div>

        {/* Results */}
        <div className="flex flex-col items-center justify-center">
          <MiniDonut value={downPayment} max={price} size={120} strokeWidth={8} color="var(--color-accent-blue)" label={`${downPaymentPct}%`} className="mb-4" />
          <div key={monthlyPayment} className="text-center animate-scale-in">
            <p className="text-xs text-muted-foreground mb-1">قسط ماهانه</p>
            <p className="text-2xl font-black text-foreground">{format(monthlyPayment)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">تومان</p>
          </div>
          <div className="flex items-center gap-6 mt-4 text-[11px] text-muted-foreground">
            <span>سود کل: {format(totalInterest)}</span>
            <span>مجموع: {format(totalPayment)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SliderField({
  label, value, onChange, min, max, step, format, suffix,
}: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number;
  format?: (v: number) => string; suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs text-muted-foreground">{label}</label>
        <span className="text-xs font-bold text-foreground">{format ? format(value) : value}{suffix}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-surface-2 accent-cyan-400
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-blue
            [&::-webkit-slider-thumb]:shadow-glow-accent
            [&::-webkit-slider-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-accent-blue) 0%, var(--color-accent-blue) ${pct}%, var(--color-surface-2) ${pct}%, var(--color-surface-2) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
