-- 049_refine_content_categories.sql
-- Replace weak categories with vehicle-news + technical-knowledge structure

BEGIN;

-- Clear existing categories (FK-safe: parent_id references set null first, then delete)
UPDATE articles SET category_id = NULL WHERE category_id IS NOT NULL;
DELETE FROM content_categories;

-- ============================================
-- NEWS CATEGORIES — vehicle market news only
-- ============================================
INSERT INTO content_categories (slug, title, description, path, sort_order) VALUES
  ('car_news',      'اخبار خودرو',       'آخرین اخبار خودروهای سواری، شاسی‌بلند و ون',           'news/car',      1),
  ('motorcycle_news','اخبار موتورسیکلت', 'جدیدترین اخبار موتورسیکلت و اسکوتر',                'news/moto',     2),
  ('truck_news',    'اخبار کامیون',      'اخبار کامیون، تریلی و کشنده',                       'news/truck',    3),
  ('industrial_news','اخبار راه‌سازی',    'اخبار ماشین‌آلات راه‌سازی و معدنی',                 'news/industrial',4),
  ('agri_news',     'اخبار کشاورزی',     'اخبار تراکتور و ادوات کشاورزی',                     'news/agri',     5),
  ('market_prices', 'بازار و قیمت‌ها',    'تحلیل بازار، قیمت روز و نوسانات',                   'news/market',   6),
  ('regulations',   'قوانین و مقررات',    'قوانین راهنمایی و رانندگی، تعرفه‌ها و بخشنامه‌ها',    'news/law',      7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ENCYCLOPEDIA CATEGORIES — technical knowledge
-- ============================================
INSERT INTO content_categories (slug, title, description, path, sort_order) VALUES
  ('knowledge', 'دانش فنی', 'مبانی فنی و دانش تخصصی خودرو', 'knowledge', 10);

DO $$
DECLARE
  kid BIGINT;
BEGIN
  SELECT id INTO kid FROM content_categories WHERE slug = 'knowledge';

  INSERT INTO content_categories (parent_id, slug, title, description, path, sort_order) VALUES
    (kid, 'engine_basics',      'اصول موتور و پیشرانه',     'شناخت انواع موتور، احتراق داخلی، سیستم سوخت‌رسانی','knowledge/engine',11),
    (kid, 'drivetrain',         'سیستم انتقال قدرت',       'گیربکس، کلاچ، دیفرانسیل و محور','knowledge/drivetrain',12),
    (kid, 'electrical',         'برق و الکترونیک',         'سیستم برق، ایسیو، سنسورها و ماژول‌ها','knowledge/electrical',13),
    (kid, 'suspension_steering','تعلیق و فرمان',           'سیستم تعلیق، کمک‌فنر، فرمان و بالانس','knowledge/suspension',14),
    (kid, 'brakes_safety',      'ترمز و ایمنی',            'انواع ترمز، ای‌بی‌اس، کنترل پایداری','knowledge/brakes',15),
    (kid, 'body_paint',         'بدنه و استایل',           'بدنه، رنگ، آستر و تعمیرات بدنه','knowledge/body',16),
    (kid, 'wheels_tires',       'تایر و چرخ',              'انواع لاستیک، رینگ، باد و فرسودگی','knowledge/tires',17),
    (kid, 'fluids_lubricants',  'روغن و سیالات',           'روغن موتور، ضد‌یخ، روغن ترمز و مایعات','knowledge/fluids',18),
    (kid, 'cooling_fuel',       'سوخت و خنک‌کاری',          'سیستم خنک‌کاری، رادیاتور، پمپ سوخت، انژکتور','knowledge/cooling_fuel',19),
    (kid, 'hvac_comfort',       'تهویه و آسایش',           'کولر، بخاری، سیستم تهویه مطبوع','knowledge/hvac',20),
    (kid, 'diagnostics',        'عیب‌یابی حرفه‌ای',        'عیب‌یابی با دستگاه دیاگ، کد خطا و رفع','knowledge/diagnostics',21),
    (kid, 'maintenance_schedule','نگهداری دوره‌ای',         'برنامه نگهداری، سرویس‌های دوره‌ای و زمان تعویض','knowledge/maintenance',22),
    (kid, 'specialized_repair', 'تعمیرات تخصصی',           'تعمیرات موتور، گیربکس، سیستم‌های پیچیده','knowledge/repair',23),
    (kid, 'tools_equipment',    'ابزار و تجهیزات',         'ابزار دستی، برقی، دستگاه‌های تخصصی','knowledge/tools',24);
END $$;

COMMIT;
