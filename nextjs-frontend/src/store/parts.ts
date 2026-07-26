export interface Part {
  id: number;
  name: string;
  partNumber: string;
  category: 'original' | 'aftermarket' | 'attachment' | 'consumable';
  categoryLabel: string;
  price: number;
  image: string;
  compatibility: string;
  description: string;
  inStock: boolean;
  manufacturer?: string;
  warranty?: string;
}

export const CATEGORY_PARTS_MAP: Record<string, number[]> = {
  car: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  sedan: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  truck: [27, 28, 29, 30, 31, 32, 33],
  trailer: [34, 35, 36, 37],
  pickup: [38, 39, 40, 41],
  loader: [42, 43, 44, 45],
  excavator: [46, 47, 48, 49, 50],
  bulldozer: [51, 52, 53, 54],
  crane: [55, 56, 57],
  tractor: [58, 59, 60, 61, 62],
  'combine-harvester': [63, 64, 65],
  forklift: [66, 67, 68],
  motorcycle: [69, 70, 71],
  generator: [72, 73, 74],
  bicycle: [75, 76, 77],
};

export const CATEGORY_PARTS_LABELS: Record<string, string> = {
  car: 'خودرو سواری',
  sedan: 'خودرو سواری',
  truck: 'کامیون',
  trailer: 'تریلی',
  pickup: 'وانت',
  loader: 'لودر',
  excavator: 'بیل مکانیکی',
  bulldozer: 'بولدوزر',
  crane: 'جرثقیل',
  tractor: 'تراکتور',
  'combine-harvester': 'کمباین',
  forklift: 'لیفتراک',
  motorcycle: 'موتورسیکلت',
  generator: 'ژنراتور',
  bicycle: 'دوچرخه',
};


