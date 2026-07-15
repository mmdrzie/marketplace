'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useFleet, useFleetVehicle } from '@/hooks/useFleet';
import type { VehicleStatus } from '@/store/fleetStore';
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS, VEHICLE_STATUS_BG, VEHICLE_STATUS_DOT } from '@/store/fleetStore';
import { Skeleton } from '@/components/common/Skeleton';
import { FleetMap } from '@/components/fleet/FleetMap';
import { FuelChart } from '@/components/fleet/FuelChart';
import { InsuranceTimeline } from '@/components/fleet/InsuranceTimeline';
import { MaintenanceCalendar } from '@/components/fleet/MaintenanceCalendar';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { FadeIn } from '@/components/common/MotionDiv';

export default function FleetVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading } = useFleetVehicle(id);
  const { data: vehicles } = useFleet();

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">
        ماشین‌آلات یافت نشد
      </div>
    );
  }

  const depreciation = vehicle.purchasePrice - vehicle.currentValue;
  const depreciationPct = Math.round((depreciation / vehicle.purchasePrice) * 100);

  return (
    <FadeIn>
      <div className="relative min-h-screen bg-background text-foreground">
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
          <Breadcrumbs />

          <div className="flex items-center gap-3 mb-6">
            <Link href="/dealer/fleet" className="btn btn-ghost btn-sm">
              <svg className="h-4 w-4 -scale-x-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              بازگشت به ناوگان
            </Link>
          </div>

          <div className={`glass rounded-2xl p-6 border mb-6 ${VEHICLE_STATUS_BG[vehicle.status as VehicleStatus]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${VEHICLE_STATUS_DOT[vehicle.status as VehicleStatus]}`} />
                  <span className={`text-xs font-bold ${VEHICLE_STATUS_COLORS[vehicle.status as VehicleStatus]}`}>
                    {VEHICLE_STATUS_LABELS[vehicle.status as VehicleStatus]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{vehicle.plateNumber}</span>
                  <span className="text-[10px] text-muted-foreground">VIN: {vehicle.vin}</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-foreground">{vehicle.name}</h1>
                <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.model} - سال {vehicle.year}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-foreground">{vehicle.currentValue.toLocaleString('fa-IR')}</div>
                <p className="text-[10px] text-muted-foreground">ارزش فعلی</p>
                <div className="text-[10px] text-destructive mt-1">کاهش: {depreciationPct}%</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <span className="text-lg font-black text-foreground">{vehicle.totalHours.toLocaleString('fa-IR')}</span>
                <p className="text-[10px] text-muted-foreground">ساعت کارکرد</p>
              </div>
              <div className="text-center">
                <span className="text-lg font-black text-foreground">{vehicle.totalMileage > 0 ? vehicle.totalMileage.toLocaleString('fa-IR') + ' km' : '—'}</span>
                <p className="text-[10px] text-muted-foreground">کارکرد</p>
              </div>
              <div className="text-center">
                <span className="text-lg font-black text-foreground">{vehicle.fuelConsumption}</span>
                <p className="text-[10px] text-muted-foreground">مصرف (L/h)</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <FuelChart data={vehicle.monthlyFuelData} />
            <InsuranceTimeline insuranceExpiry={vehicle.insuranceExpiry} inspectionExpiry={vehicle.inspectionExpiry} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <MaintenanceCalendar serviceHistory={vehicle.serviceHistory} nextService={vehicle.nextService} />
            <FleetMap vehicles={vehicles} selectedId={vehicle.id} />
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
