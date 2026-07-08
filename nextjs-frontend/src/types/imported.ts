export type ImportOrigin =
  | 'domestic'
  | 'imported_north'
  | 'imported_freezone'
  | 'imported_tehran'
  | 'imported_new';

export type CustomsStatus =
  | 'customs'
  | 'plated'
  | 'freezone_plated'
  | 'transit';

export interface ImportInfo {
  origin: ImportOrigin;
  import_country: string;
  customs_status: CustomsStatus;
  import_date?: string;
  customs_clearance_date?: string;
  chassis_number?: string;
  engine_number?: string;
}

export const IMPORT_COUNTRIES = [
  'آلمان', 'ژاپن', 'کره جنوبی', 'چین', 'آمریکا', 'فرانسه',
  'ایتالیا', 'انگلستان', 'سوئد', 'رومانی', 'روسیه', 'ترکیه', 'هند', 'سایر',
] as const;

export const CUSTOMS_STATUS_LABELS: Record<CustomsStatus, string> = {
  customs: 'گمرکی',
  plated: 'پلاک شده',
  freezone_plated: 'پلاک منطقه آزاد',
  transit: 'پلاک گذر موقت',
};

export const ORIGIN_LABELS: Record<ImportOrigin, string> = {
  domestic: 'داخلی',
  imported_north: 'وارداتی (شمال)',
  imported_freezone: 'وارداتی (منطقه آزاد)',
  imported_tehran: 'وارداتی (تهران)',
  imported_new: 'وارداتی (طرح نوین)',
};
