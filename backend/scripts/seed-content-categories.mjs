import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
});
await client.connect();

try {
  // First clear old categories
  await client.query(`UPDATE articles SET category_id = NULL WHERE category_id IS NOT NULL`);
  await client.query(`DELETE FROM content_categories`);
  console.log('🧹 Cleared old categories');

  // News categories — vehicle market news only
  await client.query(`INSERT INTO content_categories (slug, title, description, path, sort_order) VALUES
    ('car_news',      'اخبار خودرو',       'آخرین اخبار خودروهای سواری، شاسی‌بلند و ون',           'news/car',      1),
    ('motorcycle_news','اخبار موتورسیکلت', 'جدیدترین اخبار موتورسیکلت و اسکوتر',                'news/moto',     2),
    ('truck_news',    'اخبار کامیون',      'اخبار کامیون، تریلی و کشنده',                       'news/truck',    3),
    ('industrial_news','اخبار راه‌سازی',    'اخبار ماشین‌آلات راه‌سازی و معدنی',                 'news/industrial',4),
    ('agri_news',     'اخبار کشاورزی',     'اخبار تراکتور و ادوات کشاورزی',                     'news/agri',     5),
    ('market_prices', 'بازار و قیمت‌ها',    'تحلیل بازار، قیمت روز و نوسانات',                   'news/market',   6),
    ('regulations',   'قوانین و مقررات',    'قوانین راهنمایی و رانندگی، تعرفه‌ها و بخشنامه‌ها',    'news/law',      7)
  ON CONFLICT (slug) DO NOTHING`);
  console.log('✅ News categories seeded');

  // Encyclopedia parent
  await client.query(`INSERT INTO content_categories (slug, title, description, path, sort_order) VALUES
    ('knowledge', 'دانش فنی', 'مبانی فنی و دانش تخصصی خودرو', 'knowledge', 10)
  ON CONFLICT (slug) DO NOTHING`);

  const { rows } = await client.query(`SELECT id FROM content_categories WHERE slug = 'knowledge'`);
  const parentId = rows[0].id;

  // Encyclopedia subcategories — technical knowledge categories
  await client.query(`INSERT INTO content_categories (parent_id, slug, title, description, path, sort_order) VALUES
    ($1, 'engine_basics',      'اصول موتور و پیشرانه',     'شناخت انواع موتور، احتراق داخلی، سیستم سوخت‌رسانی',       'knowledge/engine',      11),
    ($1, 'drivetrain',         'سیستم انتقال قدرت',       'گیربکس، کلاچ، دیفرانسیل و محور',                        'knowledge/drivetrain',  12),
    ($1, 'electrical',         'برق و الکترونیک',         'سیستم برق، ایسیو، سنسورها و ماژول‌ها',                   'knowledge/electrical',  13),
    ($1, 'suspension_steering','تعلیق و فرمان',           'سیستم تعلیق، کمک‌فنر، فرمان و بالانس',                   'knowledge/suspension',  14),
    ($1, 'brakes_safety',      'ترمز و ایمنی',            'انواع ترمز، ای‌بی‌اس، کنترل پایداری',                    'knowledge/brakes',      15),
    ($1, 'body_paint',         'بدنه و استایل',           'بدنه، رنگ، آستر و تعمیرات بدنه',                         'knowledge/body',        16),
    ($1, 'wheels_tires',       'تایر و چرخ',              'انواع لاستیک، رینگ، باد و فرسودگی',                     'knowledge/tires',       17),
    ($1, 'fluids_lubricants',  'روغن و سیالات',           'روغن موتور، ضد‌یخ، روغن ترمز و مایعات',                  'knowledge/fluids',      18),
    ($1, 'cooling_fuel',       'سوخت و خنک‌کاری',          'سیستم خنک‌کاری، رادیاتور، پمپ سوخت، انژکتور',            'knowledge/cooling_fuel',19),
    ($1, 'hvac_comfort',       'تهویه و آسایش',           'کولر، بخاری، سیستم تهویه مطبوع',                         'knowledge/hvac',        20),
    ($1, 'diagnostics',        'عیب‌یابی حرفه‌ای',        'عیب‌یابی با دستگاه دیاگ، کد خطا و رفع',                  'knowledge/diagnostics', 21),
    ($1, 'maintenance_schedule','نگهداری دوره‌ای',         'برنامه نگهداری، سرویس‌های دوره‌ای و زمان تعویض',          'knowledge/maintenance', 22),
    ($1, 'specialized_repair', 'تعمیرات تخصصی',           'تعمیرات موتور، گیربکس، سیستم‌های پیچیده',                'knowledge/repair',      23),
    ($1, 'tools_equipment',    'ابزار و تجهیزات',         'ابزار دستی، برقی، دستگاه‌های تخصصی',                     'knowledge/tools',       24)
  ON CONFLICT (slug) DO NOTHING`, [parentId]);

  console.log('✅ Encyclopedia categories seeded');
} finally {
  await client.end();
}
