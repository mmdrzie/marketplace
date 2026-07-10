'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFleetStore, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS, VEHICLE_STATUS_BG, VEHICLE_STATUS_DOT } from '@/store/fleetStore';
import type { VehicleStatus } from '@/store/fleetStore';
import { FleetSummaryCard } from '@/components/fleet/FleetSummaryCard';
import { FleetMap } from '@/components/fleet/FleetMap';
import { FuelChart } from '@/components/fleet/FuelChart';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { FadeIn } from '@/components/common/MotionDiv';

export default function FleetPage() {
  const vehicles = useFleetStore((s) => s.vehicles);
  const [tab, setTab] = useState<VehicleStatus | 'all'>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = tab === 'all' ? vehicles : vehicles.filter((v) => v.status === tab);

  const activeCount = vehicles.filter((v) => v.status === 'published').length;
  const maintenanceCount = vehicles.filter((v) => v.status === 'maintenance').length;
  const idleCount = vehicles.filter((v) => v.status === 'idle').length;
  const totalValue = vehicles.reduce((s, v) => s + v.currentValue, 0);

  const allFuelData = vehicles.flatMap((v) => v.monthlyFuelData).reduce<Record<string, { consumption: number; cost: number }>>((acc, d) => {
    if (!acc[d.month]) acc[d.month] = { consumption: 0, cost: 0 };
    acc[d.month].consumption += d.consumption;
    acc[d.month].cost += d.cost;
    return acc;
  }, {});
  const combinedFuel = Object.entries(allFuelData).map(([month, data]) => ({ month, ...data }));

  const totalFuelCost = vehicles.reduce((s, v) => s + v.monthlyFuelData.reduce((s2, d) => s2 + d.cost, 0), 0);

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs />

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black text-foreground">مدیریت ناوگان</h1>
            <p className="text-sm text-muted-foreground mt-1">مشاهده و مدیریت تمام ماشین‌آلات</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <FleetSummaryCard
              label="دستگاه فعال"
              value={String(activeCount)}
              icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
              color="text-success"
            />
            <FleetSummaryCard
              label="در تعمیر"
              value={String(maintenanceCount)}
              icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>}
              color="text-warning"
            />
            <FleetSummaryCard
              label="بیکار"
              value={String(idleCount)}
              icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
              color="text-muted-foreground"
            />
            <FleetSummaryCard
              label="ارزش کل ناوگان"
              value={totalValue.toLocaleString('fa-IR')}
              icon={<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2" /></svg>}
              color="text-primary"
            />
          </div>

          <FleetMap vehicles={vehicles} selectedId={selectedId} onSelect={setSelectedId} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <FuelChart data={combinedFuel} />
            <div className="glass rounded-2xl p-5 border border-border-subtle">
              <h4 className="text-sm font-bold text-foreground mb-4">مصرف سوخت کل</h4>
              <div className="text-3xl font-black text-foreground">{combinedFuel.reduce((s, d) => s + d.consumption, 0).toLocaleString('fa-IR')}</div>
              <p className="text-[11px] text-muted-foreground mt-1">لیتر کل دوره</p>
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-sm font-bold text-foreground">{totalFuelCost.toLocaleString('fa-IR')}</span>
                <span className="text-[10px] text-muted-foreground mr-1">تومان هزینه سوخت</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 mt-6 mb-4">
            {[{ key: 'all' as const, label: 'همه' }, ...Object.entries(VEHICLE_STATUS_LABELS).map(([k, l]) => ({ key: k as VehicleStatus, label: l }))].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  tab === t.key ? 'bg-primary/10 text-primary border border-primary/20' : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={tab === 'all' ? 'ماشین‌آلاتی ثبت نشده' : 'ماشین‌آلاتی با این وضعیت وجود ندارد'}
              description={tab === 'all' ? 'هنوز ماشین‌آلاتی به ناوگان اضافه نشده است' : 'همه ماشین‌آلات با فیلتر فعلی مطابقت ندارند'}
              icon="default"
            />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((vehicle) => (
              <Link
                key={vehicle.id}
                href={`/dealer/fleet/${vehicle.id}`}
                className="block glass rounded-2xl p-4 border border-border-subtle hover:border-primary/20 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${VEHICLE_STATUS_DOT[vehicle.status]}`} />
                    <span className={`text-[10px] font-bold ${VEHICLE_STATUS_COLORS[vehicle.status]}`}>
                      {VEHICLE_STATUS_LABELS[vehicle.status]}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{vehicle.plateNumber}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground">{vehicle.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">{vehicle.brand} {vehicle.model} - {vehicle.year}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border text-[11px]">
                  <span className="text-muted-foreground">{vehicle.location.address.length > 25 ? vehicle.location.address.slice(0, 25) + '...' : vehicle.location.address}</span>
                  <span className="font-bold text-foreground">{vehicle.totalHours.toLocaleString('fa-IR')}h</span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
