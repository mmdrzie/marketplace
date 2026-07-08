'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

interface PartStore {
  parts: Part[];
  getPartsByCategory: (slug: string) => Part[];
  getPart: (id: number) => Part | undefined;
}

const ALL_PARTS: Part[] = [
  /* === خودرو سواری (car / sedan) === */
  { id: 1, name: 'لنت ترمز جلو', partNumber: 'BP-1001', category: 'consumable', categoryLabel: 'مصرفی', price: 850000, image: '', compatibility: 'پراید ۱۱۱, پراید ۱۳۱, پراید ۱۳۲', description: 'لنت ترمز جلو استاندارد، مناسب پراید', inStock: true, manufacturer: 'کاشانی', warranty: '۶ ماه' },
  { id: 2, name: 'لنت ترمز عقب', partNumber: 'BP-1002', category: 'consumable', categoryLabel: 'مصرفی', price: 780000, image: '', compatibility: 'پراید ۱۱۱, پراید ۱۳۱', description: 'لنت ترمز عقب با کیفیت', inStock: true, manufacturer: 'کاشانی' },
  { id: 3, name: 'دیسک ترمز جلو', partNumber: 'BD-2001', category: 'original', categoryLabel: 'قطعه اصلی', price: 2500000, image: '', compatibility: 'پژو ۲۰۶, پژو ۲۰۷, پژو ۲۰۰۸', description: 'دیسک ترمز جلو چدنی', inStock: true, manufacturer: 'OEM', warranty: '۱ سال' },
  { id: 4, name: 'کیت کلاچ کامل', partNumber: 'CK-3001', category: 'original', categoryLabel: 'قطعه اصلی', price: 4500000, image: '', compatibility: 'پراید ۱۱۱, پراید ۱۳۱, پژو ۴۰۵', description: 'کیت کلاچ کامل شامل صفحه و دیسک', inStock: true, warranty: '۱ سال' },
  { id: 5, name: 'فیلتر روغن', partNumber: 'OF-4001', category: 'consumable', categoryLabel: 'مصرفی', price: 185000, image: '', compatibility: 'پراید, پژو, سمند, تارا, رانا', description: 'فیلتر روغن استاندارد', inStock: true },
  { id: 6, name: 'فیلتر هوا', partNumber: 'AF-4002', category: 'consumable', categoryLabel: 'مصرفی', price: 220000, image: '', compatibility: 'پراید, پژو ۲۰۶, پژو ۴۰۵', description: 'فیلتر هوای کابین', inStock: true },
  { id: 7, name: 'فیلتر بنزین', partNumber: 'GF-4003', category: 'consumable', categoryLabel: 'مصرفی', price: 150000, image: '', compatibility: 'پراید, سمند, پژو ۲۰۶', description: 'فیلتر بنزین پمپ شناور', inStock: true },
  { id: 8, name: 'تسمه تایم', partNumber: 'TB-5001', category: 'original', categoryLabel: 'قطعه اصلی', price: 950000, image: '', compatibility: 'پژو ۲۰۶, پژو ۴۰۵, سمند', description: 'تسمه تایم XH, مناسب موتور TU5', inStock: true, warranty: '۲ سال' },
  { id: 9, name: 'وایر شمع', partNumber: 'SP-6001', category: 'original', categoryLabel: 'قطعه اصلی', price: 420000, image: '', compatibility: 'پراید, پژو, سمند', description: 'وایر شمع ۴ سیلندر', inStock: true },
  { id: 10, name: 'شمع موتور', partNumber: 'SP-7001', category: 'consumable', categoryLabel: 'مصرفی', price: 185000, image: '', compatibility: 'پراید, پژو ۲۰۶, پژو ۴۰۵', description: 'شمع معمولی', inStock: true },
  { id: 11, name: 'لنت ترمز عقب', partNumber: 'BP-1003', category: 'consumable', categoryLabel: 'مصرفی', price: 720000, image: '', compatibility: 'پژو ۲۰۶, پژو ۲۰۷', description: 'لنت ترمز عقب کاشانی', inStock: true },
  { id: 12, name: 'کمک فنر جلو', partNumber: 'SH-8001', category: 'aftermarket', categoryLabel: 'تأمینی', price: 3200000, image: '', compatibility: 'پراید, پژو ۴۰۵, سمند', description: 'کمک فنر جلو گازدار', inStock: true, warranty: '۱ سال' },
  { id: 13, name: 'کمک فنر عقب', partNumber: 'SH-8002', category: 'aftermarket', categoryLabel: 'تأمینی', price: 2800000, image: '', compatibility: 'پراید, پژو ۴۰۵', description: 'کمک فنر عقب روغنی', inStock: true },
  { id: 14, name: 'سیلندر ترمز اصلی', partNumber: 'BC-9001', category: 'original', categoryLabel: 'قطعه اصلی', price: 1800000, image: '', compatibility: 'پراید, سمند', description: 'سیلندر ترمز اصلی پراید', inStock: true },
  { id: 15, name: 'آلترناتور (دینام)', partNumber: 'ALT-10001', category: 'original', categoryLabel: 'قطعه اصلی', price: 5500000, image: '', compatibility: 'پژو ۲۰۶, پژو ۲۰۷, رانا', description: 'آلترناتور ۷۰ آمپر', inStock: true, warranty: '۱ سال' },
  { id: 16, name: 'استارت', partNumber: 'STR-11001', category: 'original', categoryLabel: 'قطعه اصلی', price: 4200000, image: '', compatibility: 'پراید, پژو ۴۰۵, سمند', description: 'استارت برقی ۱۲ ولت', inStock: true, warranty: '۱ سال' },
  { id: 17, name: 'باتری ۶۰ آمپر', partNumber: 'BT-12001', category: 'consumable', categoryLabel: 'مصرفی', price: 2850000, image: '', compatibility: 'پراید, پژو, سمند, تارا', description: 'باتری اتمی ۶۰ آمپر صبا باتری', inStock: true, warranty: '۱۸ ماه' },
  { id: 18, name: 'رادیاتور کامل', partNumber: 'RD-13001', category: 'aftermarket', categoryLabel: 'تأمینی', price: 3800000, image: '', compatibility: 'پراید, پراید ۱۳۲', description: 'رادیاتور آلومینیومی اصلی', inStock: true },
  { id: 19, name: 'ترموستات', partNumber: 'TH-14001', category: 'original', categoryLabel: 'قطعه اصلی', price: 350000, image: '', compatibility: 'پراید, پژو, سمند', description: 'ترموستات ۸۰ درجه', inStock: true },
  { id: 20, name: 'واشر سرسیلندر', partNumber: 'HG-15001', category: 'original', categoryLabel: 'قطعه اصلی', price: 680000, image: '', compatibility: 'پراید ۱۱۱, پراید ۱۳۱', description: 'واشر سرسیلندر فلزی', inStock: true },
  { id: 21, name: 'پمپ آب', partNumber: 'WP-16001', category: 'aftermarket', categoryLabel: 'تأمینی', price: 1200000, image: '', compatibility: 'پراید, پژو ۲۰۶', description: 'پمپ آب موتور', inStock: true },
  { id: 22, name: 'طبق جلو چپ', partNumber: 'CA-17001', category: 'aftermarket', categoryLabel: 'تأمینی', price: 980000, image: '', compatibility: 'پراید', description: 'طبق جلو چپ پراید', inStock: true },
  { id: 23, name: 'سیبک فرمان', partNumber: 'TJ-18001', category: 'aftermarket', categoryLabel: 'تأمینی', price: 320000, image: '', compatibility: 'پراید, پژو ۴۰۵, سمند', description: 'سیبک فرمان استاندارد', inStock: true },
  { id: 24, name: 'بوش طبق', partNumber: 'BS-19001', category: 'aftermarket', categoryLabel: 'تأمینی', price: 180000, image: '', compatibility: 'پراید, پژو ۴۰۵', description: 'بوش طبق کامل', inStock: true },
  { id: 25, name: 'آیینه بغل برقی', partNumber: 'MR-20001', category: 'original', categoryLabel: 'قطعه اصلی', price: 2500000, image: '', compatibility: 'پژو ۲۰۶, پژو ۲۰۷, رانا', description: 'آینه بغل برقی رنگ‌شده', inStock: true },
  { id: 26, name: 'چراغ جلو کامل', partNumber: 'HL-21001', category: 'original', categoryLabel: 'قطعه اصلی', price: 3800000, image: '', compatibility: 'پراید, پراید ۱۳۲', description: 'چراغ جلو کامل با لامپ', inStock: true },

  /* === کامیون (truck) === */
  { id: 27, name: 'فیلتر گازوئیل', partNumber: 'DF-200', category: 'consumable', categoryLabel: 'مصرفی', price: 850000, image: '', compatibility: 'FH440, FM420, Actros 2640, TGS 33.480', description: 'فیلتر گازوئیل اصلی', inStock: true },
  { id: 28, name: 'لنت ترمز کامیون', partNumber: 'TB-300', category: 'consumable', categoryLabel: 'مصرفی', price: 4500000, image: '', compatibility: 'بنز ۱۹۲۴, خاور, آتوس', description: 'لنت ترمز کامیون سنگین', inStock: true, manufacturer: 'Kavooshan' },
  { id: 29, name: 'دیسک ترمز کامیون', partNumber: 'BD-400', category: 'original', categoryLabel: 'قطعه اصلی', price: 8500000, image: '', compatibility: 'بنز ۱۹۲۴, آکسور ۱۸۴۳', description: 'دیسک ترمز جلو کامیون', inStock: true, warranty: '۲ سال' },
  { id: 30, name: 'کمپرسور باد', partNumber: 'AC-500', category: 'original', categoryLabel: 'قطعه اصلی', price: 12500000, image: '', compatibility: 'بنز ۱۹۲۴, آتوس', description: 'کمپرسور باد ترمز سنگین', inStock: true },
  { id: 31, name: 'تسمه دینام', partNumber: 'AB-600', category: 'consumable', categoryLabel: 'مصرفی', price: 450000, image: '', compatibility: 'بنز ۱۹۲۴, FH, Actros', description: 'تسمه دینام و کمپرسور', inStock: true },
  { id: 32, name: 'کمپرسی هیدرولیک', partNumber: 'HP-700', category: 'attachment', categoryLabel: 'ادوات', price: 450000000, image: '', compatibility: 'FH440, Actros 3340, TGS 33.480', description: 'کمپرسی ۲۰ متر مکعبی سه طرفه', inStock: true },
  { id: 33, name: 'بوم جرثقیل خودرویی', partNumber: 'CK-10', category: 'attachment', categoryLabel: 'ادوات', price: 185000000, image: '', compatibility: 'FM420, Actros 2640', description: 'بوم جرثقیل ۱۰ تنی خودرویی', inStock: true },

  /* === کامیون کشنده / تریلی (trailer) === */
  { id: 34, name: 'پل تریلی تریل', partNumber: 'TL-100', category: 'attachment', categoryLabel: 'ادوات', price: 280000000, image: '', compatibility: 'اسکانیا ۴۶۰, ولوو FH, بنز اکتروس', description: 'پل تریلی تریل ۳ محور', inStock: true },
  { id: 35, name: 'کفی یخچالی', partNumber: 'RF-200', category: 'attachment', categoryLabel: 'ادوات', price: 520000000, image: '', compatibility: 'اسکانیا, ولوو, بنز', description: 'کفی یخچالی ۲۰ فوت', inStock: true },
  { id: 36, name: 'لنت ترمز تریلی', partNumber: 'TB-350', category: 'consumable', categoryLabel: 'مصرفی', price: 5800000, image: '', compatibility: 'اسکانیا, ولوو, بنز', description: 'لنت ترمز تریلی استاندارد', inStock: true },
  { id: 37, name: 'کیسه هوا تریلی', partNumber: 'AB-400', category: 'aftermarket', categoryLabel: 'تأمینی', price: 8500000, image: '', compatibility: 'اسکانیا, ولوو', description: 'کیسه هوا تعلیق تریلی', inStock: true },

  /* === وانت / پیکاپ (pickup) === */
  { id: 38, name: 'کمک فنر وانت', partNumber: 'SH-300', category: 'aftermarket', categoryLabel: 'تأمینی', price: 1800000, image: '', compatibility: 'نیسان زامیاد, نیسان تک‌سوز', description: 'کمک فنر جلو وانت نیسان', inStock: true },
  { id: 39, name: 'فیلتر روغن وانت', partNumber: 'OF-500', category: 'consumable', categoryLabel: 'مصرفی', price: 250000, image: '', compatibility: 'نیسان زامیاد, لندکروز پیکاپ', description: 'فیلتر روغن وانت', inStock: true },
  { id: 40, name: 'لنت ترمز وانت', partNumber: 'BP-600', category: 'consumable', categoryLabel: 'مصرفی', price: 1200000, image: '', compatibility: 'نیسان زامیاد', description: 'لنت ترمز جلو وانت', inStock: true },
  { id: 41, name: 'اتاق وانت فلزی', partNumber: 'BK-700', category: 'attachment', categoryLabel: 'ادوات', price: 45000000, image: '', compatibility: 'نیسان زامیاد', description: 'اتاق فلزی وانت با روکش', inStock: true },

  /* === لودر (loader) === */
  { id: 42, name: 'باکت لودر', partNumber: 'BK-30', category: 'attachment', categoryLabel: 'ادوات', price: 45000000, image: '', compatibility: 'WA380, 950, LG936', description: 'باکت استاندارد ۳ متر مکعبی', inStock: true },
  { id: 43, name: 'تیغه برف‌روب', partNumber: 'SP-250', category: 'attachment', categoryLabel: 'ادوات', price: 18500000, image: '', compatibility: 'WA380, WA470, 966', description: 'تیغه برف‌روب عرض ۳ متر', inStock: true },
  { id: 44, name: 'فیلتر هوای اصلی', partNumber: 'AF-500', category: 'consumable', categoryLabel: 'مصرفی', price: 1850000, image: '', compatibility: 'WA380, WA470, LG936', description: 'فیلتر هوای کابین لودر', inStock: true },
  { id: 45, name: 'تایر لودر ۲۳.۵-۲۵', partNumber: 'TR-600', category: 'consumable', categoryLabel: 'مصرفی', price: 65000000, image: '', compatibility: 'WA380, 950, LG936', description: 'تایر لودر سیمی', inStock: true, warranty: '۱ سال' },

  /* === بیل مکانیکی (excavator) === */
  { id: 46, name: 'چکش هیدرولیک', partNumber: 'HB-200', category: 'attachment', categoryLabel: 'ادوات', price: 185000000, image: '', compatibility: 'PC200, ZX200, DX225', description: 'مناسب برای بیل مکانیکی ۲۰ تنی', inStock: true },
  { id: 47, name: 'گریپ راک', partNumber: 'GR-300', category: 'attachment', categoryLabel: 'ادوات', price: 320000000, image: '', compatibility: 'PC200, PC300, ZX330', description: 'گیره سنگ مخصوص تخریب', inStock: true },
  { id: 48, name: 'فیلتر هیدرولیک', partNumber: 'HF-1001', category: 'consumable', categoryLabel: 'مصرفی', price: 2800000, image: '', compatibility: 'PC200-8, PC300-8', description: 'فیلتر روغن هیدرولیک اصلی', inStock: true },
  { id: 49, name: 'کفشک زنجیر', partNumber: 'TS-320', category: 'aftermarket', categoryLabel: 'تأمینی', price: 8500000, image: '', compatibility: 'PC200, ZX200, DX225', description: 'کفشک زنجیر استاندارد ۵۰۰ میلیمتر', inStock: true },
  { id: 50, name: 'پمپ هیدرولیک اصلی', partNumber: 'HP-800', category: 'original', categoryLabel: 'قطعه اصلی', price: 380000000, image: '', compatibility: 'PC200, PC300', description: 'پمپ هیدرولیک بیل مکانیکی', inStock: true, warranty: '۱ سال' },

  /* === بولدوزر (bulldozer) === */
  { id: 51, name: 'ریپر (Ripper)', partNumber: 'RP-400', category: 'attachment', categoryLabel: 'ادوات', price: 98000000, image: '', compatibility: 'D85, D155, D6', description: 'ریپر عقب مخصوص خاک‌های سخت', inStock: true },
  { id: 52, name: 'تیغه U-Blade', partNumber: 'UB-300', category: 'attachment', categoryLabel: 'ادوات', price: 125000000, image: '', compatibility: 'D85, D155', description: 'تیغه U شکل برای جابجایی مواد نرم', inStock: true },
  { id: 53, name: 'کفشک زنجیر عریض', partNumber: 'WTS-560', category: 'aftermarket', categoryLabel: 'تأمینی', price: 12000000, image: '', compatibility: 'D85, D65, D6', description: 'کفشک عریض ۵۶۰ میلیمتر برای زمین‌های سست', inStock: true },
  { id: 54, name: 'رولر پایینی', partNumber: 'RL-700', category: 'original', categoryLabel: 'قطعه اصلی', price: 28000000, image: '', compatibility: 'D85, D65', description: 'رولر پایینی زنجیر', inStock: true },

  /* === جرثقیل (crane) === */
  { id: 55, name: 'قلاب جرثقیل', partNumber: 'HK-50', category: 'attachment', categoryLabel: 'ادوات', price: 45000000, image: '', compatibility: 'STC250, LTM1050', description: 'قلاب ۵۰ تنی استاندارد', inStock: true },
  { id: 56, name: 'ریموت کنترل', partNumber: 'RC-100', category: 'original', categoryLabel: 'قطعه اصلی', price: 12500000, image: '', compatibility: 'STC250, STC500, XCA130', description: 'ریموت کنترل بی‌سیم جرثقیل', inStock: true },
  { id: 57, name: 'بوم جرثقیل', partNumber: 'BM-200', category: 'original', categoryLabel: 'قطعه اصلی', price: 650000000, image: '', compatibility: 'STC250, XCA130', description: 'بوم جرثقیل ۶ متری', inStock: false },

  /* === تراکتور (tractor) === */
  { id: 58, name: 'گاوآهن دوطرفه', partNumber: 'PL-400', category: 'attachment', categoryLabel: 'ادوات', price: 28000000, image: '', compatibility: 'IT399, MF285, 5075', description: 'گاوآهن دوطرفه ۴ خیش', inStock: true },
  { id: 59, name: 'سمپاش بوم‌دار', partNumber: 'SP-1200', category: 'attachment', categoryLabel: 'ادوات', price: 18500000, image: '', compatibility: 'IT285, IT399, 5090', description: 'سمپاش بوم‌دار ۱۲۰۰ لیتری', inStock: true },
  { id: 60, name: 'تیغه ماله', partNumber: 'BL-300', category: 'attachment', categoryLabel: 'ادوات', price: 12500000, image: '', compatibility: 'IT285, MF285, 5075', description: 'تیغه ماله تسطیح اراضی', inStock: true },
  { id: 61, name: 'فیلتر روغن تراکتور', partNumber: 'OF-800', category: 'consumable', categoryLabel: 'مصرفی', price: 350000, image: '', compatibility: 'MF285, IT399, 5075', description: 'فیلتر روغن تراکتور', inStock: true },
  { id: 62, name: 'دیسک پنجه غازی', partNumber: 'DS-500', category: 'attachment', categoryLabel: 'ادوات', price: 35000000, image: '', compatibility: 'MF285, IT285', description: 'دیسک ۲۴ پره پنجه غازی', inStock: true },

  /* === کمباین (combine-harvester) === */
  { id: 63, name: 'تیغه درو', partNumber: 'CB-100', category: 'consumable', categoryLabel: 'مصرفی', price: 8500000, image: '', compatibility: 'John Deere S760, Claas Lexion', description: 'تیغه درو کمباین', inStock: true },
  { id: 64, name: 'زنجیر نقاله', partNumber: 'CH-200', category: 'original', categoryLabel: 'قطعه اصلی', price: 25000000, image: '', compatibility: 'John Deere S760, S780', description: 'زنجیر نقاله محصول', inStock: true },
  { id: 65, name: 'تسمه پروانه', partNumber: 'BL-300', category: 'consumable', categoryLabel: 'مصرفی', price: 3800000, image: '', compatibility: 'John Deere, Claas', description: 'تسمه پروانه کمباین', inStock: true },

  /* === لیفتراک (forklift) === */
  { id: 66, name: 'تایر لیفتراک', partNumber: 'FT-100', category: 'consumable', categoryLabel: 'مصرفی', price: 8500000, image: '', compatibility: 'تویوتا ۳ تن, توسان ۳ تن', description: 'تایر لیفتراک ۲۱x۸x۱۵', inStock: true },
  { id: 67, name: 'زنجیر دکل', partNumber: 'FC-200', category: 'original', categoryLabel: 'قطعه اصلی', price: 12000000, image: '', compatibility: 'تویوتا ۳ تن', description: 'زنجیر دکل لیفتراک', inStock: true },
  { id: 68, name: 'فیلتر هیدرولیک', partNumber: 'FH-300', category: 'consumable', categoryLabel: 'مصرفی', price: 1200000, image: '', compatibility: 'تویوتا, توسان, نیسان', description: 'فیلتر هیدرولیک لیفتراک', inStock: true },

  /* === موتورسیکلت (motorcycle) === */
  { id: 69, name: 'زنجیر موتور', partNumber: 'MC-100', category: 'original', categoryLabel: 'قطعه اصلی', price: 850000, image: '', compatibility: 'هوندا CG125, Bajaj Pulsar', description: 'زنجیر موتور ۴۲۸', inStock: true },
  { id: 70, name: 'لاستیک عقب', partNumber: 'MT-200', category: 'consumable', categoryLabel: 'مصرفی', price: 2500000, image: '', compatibility: 'هوندا CG125, هوندا ۱۲۵', description: 'لاستیک عقب ۲.۷۵-۱۸', inStock: true },
  { id: 71, name: 'فیلتر هوا', partNumber: 'MA-300', category: 'consumable', categoryLabel: 'مصرفی', price: 180000, image: '', compatibility: 'هوندا CG125, Bajaj', description: 'فیلتر هوای موتور سیکلت', inStock: true },

  /* === ژنراتور (generator) === */
  { id: 72, name: 'فیلتر گازوئیل ژنراتور', partNumber: 'GF-100', category: 'consumable', categoryLabel: 'مصرفی', price: 380000, image: '', compatibility: 'کامینز ۲۰۰ کاوا, پرکینز', description: 'فیلتر گازوئیل ژنراتور', inStock: true },
  { id: 73, name: 'شمع ژنراتور', partNumber: 'GS-200', category: 'consumable', categoryLabel: 'مصرفی', price: 250000, image: '', compatibility: 'موتور برق بنزینی', description: 'شمع ژنراتور', inStock: true },
  { id: 74, name: 'AVR (تنظیم‌کننده ولتاژ)', partNumber: 'AV-300', category: 'original', categoryLabel: 'قطعه اصلی', price: 8500000, image: '', compatibility: 'کامینز, پرکینز, استمفورد', description: 'تنظیم‌کننده خودکار ولتاژ', inStock: true },

  /* === دوچرخه (bicycle) === */
  { id: 75, name: 'تیوپ دوچرخه ۲۹', partNumber: 'BT-100', category: 'consumable', categoryLabel: 'مصرفی', price: 185000, image: '', compatibility: 'اسکات اسپکت, رالی', description: 'تیوپ دوچرخه ۲۹ اینچ', inStock: true },
  { id: 76, name: 'زنجیر دوچرخه', partNumber: 'BC-200', category: 'original', categoryLabel: 'قطعه اصلی', price: 350000, image: '', compatibility: 'Shimano Deore 11 سرعته', description: 'زنجیر دوچرخه کوهستان', inStock: true },
  { id: 77, name: 'لنت ترمز دوچرخه', partNumber: 'BB-300', category: 'consumable', categoryLabel: 'مصرفی', price: 180000, image: '', compatibility: 'ترمس دیسکی هیدرولیک', description: 'لنت ترمز دیسکی', inStock: true },
];

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

export const usePartStore = create<PartStore>()(
  devtools(
    () => ({
      parts: ALL_PARTS,
      getPartsByCategory: (slug: string) => {
        const ids = CATEGORY_PARTS_MAP[slug] || [];
        return ids.map((id) => ALL_PARTS.find((p) => p.id === id)!).filter(Boolean);
      },
      getPart: (id: number) => ALL_PARTS.find((p) => p.id === id),
    }),
    { name: 'part-store' },
  ),
);
