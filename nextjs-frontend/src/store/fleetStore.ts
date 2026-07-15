export type VehicleStatus = 'active' | 'maintenance' | 'idle' | 'sold';

export interface FleetVehicle {
  id: number;
  name: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string;
  status: VehicleStatus;
  location: { lat: number; lng: number; address: string };
  fuelConsumption: number;
  lastService: string;
  nextService: string;
  insuranceExpiry: string;
  inspectionExpiry: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  totalHours: number;
  totalMileage: number;
  monthlyFuelData: { month: string; consumption: number; cost: number }[];
  serviceHistory: { date: string; type: string; cost: number; description: string }[];
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  active: 'فعال',
  maintenance: 'در تعمیر',
  idle: 'بیکار',
  sold: 'فروخته شده',
};

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, string> = {
  active: 'text-success',
  maintenance: 'text-warning',
  idle: 'text-muted-foreground',
  sold: 'text-destructive',
};

export const VEHICLE_STATUS_BG: Record<VehicleStatus, string> = {
  active: 'bg-success/10 border-success/20',
  maintenance: 'bg-warning/10 border-warning/20',
  idle: 'bg-surface-2 border-border-subtle',
  sold: 'bg-destructive/10 border-destructive/20',
};

export const VEHICLE_STATUS_DOT: Record<VehicleStatus, string> = {
  active: 'bg-success',
  maintenance: 'bg-warning',
  idle: 'bg-muted-foreground',
  sold: 'bg-destructive',
};
