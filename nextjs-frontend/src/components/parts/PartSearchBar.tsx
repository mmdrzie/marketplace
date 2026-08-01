'use client';

import { useState } from 'react';
import { VehicleSelector } from './VehicleSelector';

interface Props {
  onSearch: (text: string) => void;
  onVehicleSelect: (brandId: string | null, modelId: number | null, year: number | null) => void;
  initialText?: string;
}

export function PartSearchBar({ onSearch, onVehicleSelect, initialText }: Props) {
  const [text, setText] = useState(initialText || '');
  const [showVehicle, setShowVehicle] = useState(false);

  return (
    <div className="space-y-3">
      <div className="relative">
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); onSearch(e.target.value); }}
          placeholder="جستجوی قطعه بر اساس نام، کد یا OEM..."
          className="w-full bg-surface/60 border border-border rounded-2xl py-3 pr-12 pl-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors backdrop-blur-sm"
        />
      </div>

      <button
        onClick={() => setShowVehicle(!showVehicle)}
        className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-xl border transition-all ${
          showVehicle ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface/40 text-muted-foreground border-border hover:text-foreground'
        }`}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
        </svg>
        جستجو بر اساس خودرو
      </button>

      {showVehicle && (
        <VehicleSelector onSelect={onVehicleSelect} />
      )}
    </div>
  );
}
