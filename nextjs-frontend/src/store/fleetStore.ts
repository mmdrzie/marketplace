'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';

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

interface FleetState {
  vehicles: FleetVehicle[];
  updateVehicle: (id: number, data: Partial<FleetVehicle>) => void;
  getVehicle: (id: number) => FleetVehicle | undefined;
}

export const useFleetStore = create<FleetState>()(
  devtools(
    persist(
    (set, get) => ({
      vehicles: [
        {
          id: 1,
          name: 'بیل مکانیکی PC200-8',
          type: 'بیل مکانیکی',
          brand: 'کوماتسو',
          model: 'PC200-8',
          year: 1398,
          plateNumber: '۱۲۳-۴۵۶-۷۸',
          vin: 'KMT0012345678',
          status: 'active',
          location: { lat: 35.6892, lng: 51.3890, address: 'تهران، پروژه مترو خط ۷' },
          fuelConsumption: 18.5,
          lastService: '۱۴۰۳/۰۴',
          nextService: '۱۴۰۳/۰۸',
          insuranceExpiry: '۱۴۰۳/۱۲',
          inspectionExpiry: '۱۴۰۴/۰۲',
          purchaseDate: '۱۴۰۱/۰۳',
          purchasePrice: 4500000000,
          currentValue: 3800000000,
          totalHours: 4850,
          totalMileage: 0,
          monthlyFuelData: [
            { month: 'فروردین', consumption: 420, cost: 31500000 },
            { month: 'اردیبهشت', consumption: 510, cost: 38250000 },
            { month: 'خرداد', consumption: 480, cost: 36000000 },
            { month: 'تیر', consumption: 530, cost: 39750000 },
          ],
          serviceHistory: [
            { date: '۱۴۰۳/۰۴', type: 'تعویض روغن', cost: 8500000, description: 'تعویض روغن هیدرولیک و فیلتر' },
            { date: '۱۴۰۳/۰۲', type: 'تعمیر', cost: 45000000, description: 'تعمیر پمپ هیدرولیک' },
            { date: '۱۴۰۲/۱۲', type: 'سرویس دوره‌ای', cost: 12500000, description: 'سرویس ۵۰۰ ساعته' },
          ],
        },
        {
          id: 2,
          name: 'لودر کاترپیلار 966',
          type: 'لودر',
          brand: 'کاترپیلار',
          model: '966H',
          year: 1396,
          plateNumber: '۲۳۴-۵۶۷-۸۹',
          vin: 'CAT0098765432',
          status: 'active',
          location: { lat: 35.7152, lng: 51.4201, address: 'تهران، معدن شن و ماسه' },
          fuelConsumption: 22.0,
          lastService: '۱۴۰۳/۰۳',
          nextService: '۱۴۰۳/۰۷',
          insuranceExpiry: '۱۴۰۳/۰۹',
          inspectionExpiry: '۱۴۰۴/۰۱',
          purchaseDate: '۱۴۰۰/۰۶',
          purchasePrice: 6200000000,
          currentValue: 4800000000,
          totalHours: 7200,
          totalMileage: 0,
          monthlyFuelData: [
            { month: 'فروردین', consumption: 680, cost: 51000000 },
            { month: 'اردیبهشت', consumption: 750, cost: 56250000 },
            { month: 'خرداد', consumption: 710, cost: 53250000 },
            { month: 'تیر', consumption: 790, cost: 59250000 },
          ],
          serviceHistory: [
            { date: '۱۴۰۳/۰۳', type: 'سرویس ۱۰۰۰ ساعته', cost: 18500000, description: 'سرویس کامل موتور و هیدرولیک' },
            { date: '۱۴۰۲/۱۱', type: 'تعویض لاستیک', cost: 96000000, description: 'تعویض ۴ حلقه لاستیک جلو' },
          ],
        },
        {
          id: 3,
          name: 'کامیون FH440',
          type: 'کامیون',
          brand: 'ولوو تراکس',
          model: 'FH440',
          year: 1400,
          plateNumber: '۳۴۵-۶۷۸-۹۰',
          vin: 'VOL0011223344',
          status: 'maintenance',
          location: { lat: 35.7310, lng: 51.3670, address: 'تهران، تعمیرگاه مرکزی' },
          fuelConsumption: 32.0,
          lastService: '۱۴۰۳/۰۱',
          nextService: '۱۴۰۳/۰۶',
          insuranceExpiry: '۱۴۰۴/۰۳',
          inspectionExpiry: '۱۴۰۳/۱۱',
          purchaseDate: '۱۴۰۱/۰۹',
          purchasePrice: 3800000000,
          currentValue: 3200000000,
          totalHours: 3200,
          totalMileage: 185000,
          monthlyFuelData: [
            { month: 'فروردین', consumption: 920, cost: 69000000 },
            { month: 'اردیبهشت', consumption: 850, cost: 63750000 },
            { month: 'خرداد', consumption: 0, cost: 0 },
            { month: 'تیر', consumption: 0, cost: 0 },
          ],
          serviceHistory: [
            { date: '۱۴۰۳/۰۱', type: 'سرویس دوره‌ای', cost: 15000000, description: 'سرویس ۳۰۰۰۰ کیلومتری' },
            { date: '۱۴۰۲/۰۷', type: 'تعمیر موتور', cost: 185000000, description: 'بازسازی کامل موتور' },
          ],
        },
        {
          id: 4,
          name: 'بولدوزر D85',
          type: 'بولدوزر',
          brand: 'کوماتسو',
          model: 'D85EX-15',
          year: 1397,
          plateNumber: '۴۵۶-۷۸۹-۰۱',
          vin: 'KMT0099887766',
          status: 'idle',
          location: { lat: 35.8020, lng: 51.0100, address: 'کرج، انبار مرکزی' },
          fuelConsumption: 28.0,
          lastService: '۱۴۰۳/۰۲',
          nextService: '۱۴۰۳/۰۵',
          insuranceExpiry: '۱۴۰۳/۰۸',
          inspectionExpiry: '۱۴۰۳/۰۶',
          purchaseDate: '۱۳۹۹/۱۲',
          purchasePrice: 5500000000,
          currentValue: 3500000000,
          totalHours: 6200,
          totalMileage: 0,
          monthlyFuelData: [
            { month: 'فروردین', consumption: 0, cost: 0 },
            { month: 'اردیبهشت', consumption: 0, cost: 0 },
            { month: 'خرداد', consumption: 0, cost: 0 },
            { month: 'تیر', consumption: 0, cost: 0 },
          ],
          serviceHistory: [
            { date: '۱۴۰۳/۰۲', type: 'سرویس دوره‌ای', cost: 22000000, description: 'سرویس ۵۰۰ ساعته' },
          ],
        },
      ],
      updateVehicle: (id, data) => {
        set((s) => ({
          vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...data } : v)),
        }));
      },
      getVehicle: (id) => {
        return get().vehicles.find((v) => v.id === id);
      },
    }),
    {
      name: 'fleet-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => persisted as FleetState,
      partialize: (state) => ({
        vehicles: state.vehicles,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error('fleet-store rehydration failed:', error);
      },
    },
  ),
  { name: 'fleet-storage', enabled: process.env.NODE_ENV === 'development' },
)
);

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
