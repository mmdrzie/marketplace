'use client';

import type { FleetVehicle, VehicleStatus } from '@/store/fleetStore';
import { VEHICLE_STATUS_DOT } from '@/store/fleetStore';

interface FleetMapProps {
  vehicles: FleetVehicle[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
}

export function FleetMap({ vehicles, selectedId, onSelect }: FleetMapProps) {
  const minLat = Math.min(...vehicles.map((v) => v.location.lat)) - 0.02;
  const maxLat = Math.max(...vehicles.map((v) => v.location.lat)) + 0.02;
  const minLng = Math.min(...vehicles.map((v) => v.location.lng)) - 0.02;
  const maxLng = Math.max(...vehicles.map((v) => v.location.lng)) + 0.02;

  const pad = 40;
  const w = 800;
  const h = 300;
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  function toX(lng: number) { return pad + ((lng - minLng) / lngRange) * (w - pad * 2); }
  function toY(lat: number) { return pad + ((maxLat - lat) / latRange) * (h - pad * 2); }

  return (
    <div className="glass rounded-2xl p-4 border border-border-subtle">
      <h3 className="text-sm font-bold text-foreground mb-3">موقعیت ماشین‌آلات</h3>
      <div className="relative w-full overflow-hidden rounded-xl bg-surface-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxHeight: 300 }}>
          <defs>
            <radialGradient id="pulse-glow">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
          </defs>
          {vehicles.map((v) => {
            const x = toX(v.location.lng);
            const y = toY(v.location.lat);
            const isSelected = v.id === selectedId;
            return (
              <g
                key={v.id}
                onClick={() => onSelect?.(v.id)}
                className="cursor-pointer"
              >
                <circle cx={x} cy={y} r="20" fill={`url(#pulse-glow)`} className={VEHICLE_STATUS_DOT[v.status]} opacity="0.15" />
                <circle cx={x} cy={y} r="6" className={VEHICLE_STATUS_DOT[v.status]} stroke="white" strokeWidth="2.5" />
                {isSelected && (
                  <g>
                    <rect x={x - 60} y={y - 38} width="120" height="24" rx="6" className="fill-background stroke-border" strokeWidth="0.5" />
                    <text x={x} y={y - 22} textAnchor="middle" className="fill-foreground" fontSize="9" fontWeight="600">
                      {v.name.length > 18 ? v.name.slice(0, 18) + '...' : v.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="flex items-center justify-end gap-3 mt-2">
        {(['active', 'maintenance', 'idle'] as VehicleStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className={`w-2 h-2 rounded-full ${VEHICLE_STATUS_DOT[s]}`} />
            {s === 'active' ? 'فعال' : s === 'maintenance' ? 'تعمیرات' : 'بیکار'}
          </span>
        ))}
      </div>
    </div>
  );
}
