import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

function slugify(text) {
  const slugMap = {
    ' ': '-', '‌': '-', 'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
    'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
    'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
    'ع': '', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm',
    'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y', 'ئ': 'y',
    '0': '0','1': '1','2': '2','3': '3','4': '4','5': '5','6': '6','7': '7','8': '8','9': '9',
    '(': '', ')': '', '[': '', ']': '', '.': '-', '×': 'x',
  };
  let result = '';
  for (const ch of text.toLowerCase().trim()) {
    result += slugMap[ch] || (ch.match(/[a-z0-9\-]/) ? ch : '');
  }
  return result.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ---- 1. Usage Types as categories ----
const usageTypes = [
  { name: 'اتوبوس', nameEn: 'Bus', parentSlug: 'vehicles', sort: 5, icon: 'bus' },
  { name: 'مینی بوس', nameEn: 'Minibus', parentSlug: 'vehicles', sort: 6, icon: 'minibus' },
  { name: 'ون تجاری', nameEn: 'Commercial Van', parentSlug: 'vehicles', sort: 7, icon: 'van' },
  { name: 'کشنده تک محور', nameEn: 'Single Axle Tractor', parentSlug: 'truck', sort: 1, icon: 'tractor' },
  { name: 'کشنده دو محور', nameEn: 'Dual Axle Tractor', parentSlug: 'truck', sort: 2, icon: 'tractor' },
  { name: 'کامیون تک محور', nameEn: 'Single Axle Truck', parentSlug: 'truck', sort: 3, icon: 'truck' },
  { name: 'کامیون دو محور', nameEn: 'Dual Axle Truck', parentSlug: 'truck', sort: 4, icon: 'truck' },
  { name: 'کامیون چهار محور', nameEn: 'Four Axle Truck', parentSlug: 'truck', sort: 5, icon: 'truck' },
  { name: 'کامیونت (خاور)', nameEn: 'Light Truck', parentSlug: 'truck', sort: 6, icon: 'truck' },
  { name: 'تریلر دو محور', nameEn: 'Dual Axle Trailer', parentSlug: 'truck', sort: 7, icon: 'trailer' },
  { name: 'تریلر سه محور', nameEn: 'Three Axle Trailer', parentSlug: 'truck', sort: 8, icon: 'trailer' },
  { name: 'تریلر کمرشکن - بوژی', nameEn: 'Semi Trailer', parentSlug: 'truck', sort: 9, icon: 'trailer' },
];

const constructionUsageTypes = [
  { name: 'بیل مکانیکی چرخی', nameEn: 'Wheel Excavator', parentSlug: 'construction-machinery', sort: 1, icon: 'excavator' },
  { name: 'بیل مکانیکی زنجیری', nameEn: 'Track Excavator', parentSlug: 'construction-machinery', sort: 2, icon: 'excavator' },
  { name: 'لودر بکهو', nameEn: 'Backhoe Loader', parentSlug: 'construction-machinery', sort: 3, icon: 'loader' },
  { name: 'لودر چرخی', nameEn: 'Wheel Loader', parentSlug: 'construction-machinery', sort: 4, icon: 'loader' },
  { name: 'لودر زنجیری', nameEn: 'Track Loader', parentSlug: 'construction-machinery', sort: 5, icon: 'loader' },
];

let catCount = 0;
for (const ut of [...usageTypes, ...constructionUsageTypes]) {
  const parent = await pool.query('SELECT id FROM categories WHERE slug = $1', [ut.parentSlug]);
  if (parent.rows.length === 0) {
    console.log(`[SKIP] parent not found: ${ut.parentSlug}`);
    continue;
  }
  const slug = slugify(ut.name);
  await pool.query(
    `INSERT INTO categories (name, name_en, slug, icon, parent_id, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (slug) DO NOTHING`,
    [ut.name, ut.nameEn, slug, ut.icon, parent.rows[0].id, ut.sort]
  );
  catCount++;
}
console.log(`categories added: ${catCount}`);

// ---- 2. Brands ----
const brandNames = [
  'آتین خودرو دیزل', 'آذرخش', 'آران ماشین', 'آرتابان دیزل', 'آرشام دیزل', 'آرنا پلاس',
  'آریا', 'آریا آکام', 'آریا صنعت آذربایجان', 'آکوفیدار', 'آکیا', 'آلیس چالمرز', 'آمیکو',
  'ابراهیم', 'اروم', 'اروم سرما', 'اس دی ال جی (SDLG)', 'اس دی ای سی (SDAC)', 'استریک',
  'اسکانیا', 'اسنو پارس', 'اشمیتز', 'اطلس دویتز', 'البرز', 'الوند', 'امپاور', 'اوجا آرکا گستر',
  'ایران خودرو دیزل', 'ایران رخش', 'ایران کاوه', 'ایسوزو', 'ایفا', 'ایکس جی ام ای (XGMA)',
  'ایکس سی ام جی (XCMG)', 'اینترنشنال', 'ایویکو', 'بابکت', 'بایک', 'بروک وی', 'بونیز',
  'بی ام سی (BMC)', 'بی بن', 'پانیذ', 'پوکلن', 'پویا خودرو ماهان', 'پویا صنعت کردستان',
  'پیشرو دیزل', 'پیلسان دیزل', 'تایتان', 'ترکس', 'توحید صنعت', 'توماس', 'تویوتا',
  'تی دی ال (TDL)', 'تیراژه ماشین', 'تیرکس', 'تیکا', 'جک', 'جی ام سی (GMC)', 'جی ام سی (JMC)',
  'جی سی بی (JCB)', 'جیران صنعت', 'چانگلین', 'حنیفرام', 'خاور', 'داف', 'دافران', 'دانگ فنگ',
  'دایون', 'درستا', 'دلتا راه ماشین', 'دوسان', 'دوو', 'راگا', 'رنو', 'روور', 'زاگرس', 'زامیاد',
  'زرین کوپال', 'زوم لاین', 'زیل', 'ژانگ تانگ', 'سانوارد', 'سانی', 'سبلان خودرو',
  'سپاهان ماشین', 'سهند', 'سی اند سی (C&C)', 'سیترا', 'سینوتراک', 'شاپور', 'شاد خودرو',
  'شاکمان', 'شانتوی', 'شک موتو', 'شورولت', 'شیلر', 'طارق', 'عقاب افشان', 'فاو', 'فراز',
  'فردا دیزل', 'فردا ماشین', 'فرداد پایش', 'فوتون', 'فوتون لوول', 'فورس', 'فوروکاوا',
  'فوریوز', 'فوسو', 'فولکس واگن', 'فیات', 'فیات آلیس', 'کارسان', 'کاشان صنعت', 'کالابرس',
  'کالمار', 'کاما', 'کاماز', 'کامل دیزل', 'کاوازاکی', 'کاوه', 'کاویان', 'کترپیلار', 'کوبلکو',
  'کوگل', 'کوماتسو', 'کیا', 'کیس', 'کینگ', 'گاز', 'گازار', 'گلدهوفر', 'لیبهر', 'لیلاند',
  'لیوگانگ', 'مارال', 'ماز', 'ماک', 'ماموت', 'مان', 'مایان', 'مبارز', 'مرسدس بنز', 'مکسوس',
  'مهران سرد', 'میرمحمد', 'نئوپلان', 'نصف جهان', 'نوین دیزل', 'نیو هالند', 'وایت', 'وزین',
  'ولوو', 'هپکو', 'هرون', 'هلیکو', 'هیتاچی', 'هیدرومک', 'هیوندای', 'یاقوت', 'یوتانگ', 'یوجین',
];

const brandRows = brandNames.map((name) => ({ name: name.trim(), slug: slugify(name.trim()) }));

const BATCH_B = 100;
let brandInserted = 0;
for (let i = 0; i < brandRows.length; i += BATCH_B) {
  const batch = brandRows.slice(i, i + BATCH_B);
  const vals = batch.map((_, j) => `($${j * 2 + 1}, $${j * 2 + 2}, true, NOW(), NOW())`).join(',');
  const params = batch.flatMap((b) => [b.name, b.slug]);
  await pool.query(
    `INSERT INTO brands (name, slug, is_active, created_at, updated_at)
     VALUES ${vals} ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name`,
    params
  );
  brandInserted += batch.length;
  process.stdout.write(`\rbrands: ${brandInserted}/${brandRows.length}`);
}
console.log(`\ncommercial brands total: ${brandRows.length} (many may already exist)`);

await pool.end();
