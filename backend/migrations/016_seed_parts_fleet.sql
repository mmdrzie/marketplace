BEGIN;

-- Seed parts (subset of common parts matching category slugs)
INSERT INTO parts (name, part_number, category, category_label, price, compatibility, description, in_stock, category_slug) VALUES
('لنت ترمز جلو', 'BP-1001', 'consumable', 'مصرفی', 850000, 'پراید ۱۱۱, پراید ۱۳۱, پراید ۱۳۲', 'لنت ترمز جلو استاندارد', true, 'car'),
('فیلتر روغن', 'OF-4001', 'consumable', 'مصرفی', 185000, 'پراید, پژو, سمند, تارا', 'فیلتر روغن استاندارد', true, 'car'),
('فیلتر هوا', 'AF-4002', 'consumable', 'مصرفی', 220000, 'پراید, پژو ۲۰۶, پژو ۴۰۵', 'فیلتر هوای کابین', true, 'car'),
('لنت ترمز کامیون', 'TB-300', 'consumable', 'مصرفی', 4500000, 'بنز ۱۹۲۴, خاور, آتوس', 'لنت ترمز کامیون سنگین', true, 'truck'),
('فیلتر گازوئیل', 'DF-200', 'consumable', 'مصرفی', 850000, 'FH440, FM420, Actros', 'فیلتر گازوئیل اصلی', true, 'truck'),
('باکت لودر', 'BK-30', 'attachment', 'ادوات', 45000000, 'WA380, 950, LG936', 'باکت استاندارد ۳ متر مکعبی', true, 'loader'),
('چکش هیدرولیک', 'HB-200', 'attachment', 'ادوات', 185000000, 'PC200, ZX200, DX225', 'مناسب برای بیل مکانیکی ۲۰ تنی', true, 'excavator'),
('کفشک زنجیر', 'TS-320', 'aftermarket', 'تأمینی', 8500000, 'PC200, ZX200, DX225', 'کفشک زنجیر استاندارد', true, 'excavator'),
('کمپرسی هیدرولیک', 'HP-700', 'attachment', 'ادوات', 450000000, 'FH440, Actros 3340', 'کمپرسی ۲۰ متر مکعبی', true, 'truck'),
('باتری ۶۰ آمپر', 'BT-12001', 'consumable', 'مصرفی', 2850000, 'پراید, پژو, سمند, تارا', 'باتری اتمی ۶۰ آمپر', true, 'car'),
('تایر لودر', 'TR-600', 'consumable', 'مصرفی', 65000000, 'WA380, 950, LG936', 'تایر لودر سیمی', true, 'loader'),
('گاوآهن دوطرفه', 'PL-400', 'attachment', 'ادوات', 28000000, 'IT399, MF285', 'گاوآهن دوطرفه ۴ خیش', true, 'tractor'),
('فیلتر روغن تراکتور', 'OF-800', 'consumable', 'مصرفی', 350000, 'MF285, IT399', 'فیلتر روغن تراکتور', true, 'tractor'),
('زنجیر موتور', 'MC-100', 'original', 'قطعه اصلی', 850000, 'هوندا CG125', 'زنجیر موتور ۴۲۸', true, 'motorcycle'),
('پمپ هیدرولیک', 'HP-800', 'original', 'قطعه اصلی', 380000000, 'PC200, PC300', 'پمپ هیدرولیک بیل مکانیکی', true, 'excavator')
ON CONFLICT DO NOTHING;

COMMIT;
