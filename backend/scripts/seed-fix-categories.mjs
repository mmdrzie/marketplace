import pg from 'pg';
import { readFileSync } from 'fs';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 3,
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

// Schema
await pool.query(`CREATE TABLE IF NOT EXISTS brand_categories (
  brand_id BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (brand_id, category_id))`);
await pool.query(`DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicle_models' AND column_name='category_id') THEN
    ALTER TABLE vehicle_models ADD COLUMN category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_vehicle_models_category_id ON vehicle_models(category_id);
  END IF;
END $$;`);
console.log('[OK] schema');

// Load brands & cats into memory
const [{ rows: allBrands }, { rows: cats }] = await Promise.all([
  pool.query('SELECT id, slug FROM brands'),
  pool.query("SELECT id, slug FROM categories WHERE slug IN ('sedan','motorcycles','truck')"),
]);
const brandMap = {};
for (const b of allBrands) brandMap[b.slug] = b.id;
const catMap = {};
for (const c of cats) catMap[c.slug] = c.id;

// Clear
await pool.query('DELETE FROM brand_categories');
await pool.query('DELETE FROM vehicle_variant_attributes');
await pool.query('DELETE FROM vehicle_variants');
await pool.query('DELETE FROM vehicle_models');
console.log('[OK] cleared');

// Read source data once
const carData = JSON.parse(readFileSync('C:\\Users\\MR\\Desktop\\New Text Document (4).txt', 'utf-8'));
const mcData = JSON.parse(readFileSync('C:\\Users\\MR\\Desktop\\New Text Document (5).txt', 'utf-8'));

// Build model rows in memory per category
function buildRows(data, catSlug) {
  const rows = [];
  for (const entry of data) {
    const brandName = entry.brand.trim();
    if (!brandName) continue;
    const brandId = brandMap[slugify(brandName)];
    if (!brandId) continue;
    for (const mf of entry.models || []) {
      let mn = mf.trim();
      if (mn.startsWith(brandName)) mn = mn.slice(brandName.length).trim();
      mn = mn.replace(/^[\s\-]+/, '').trim();
      if (!mn) continue;
      rows.push({ brandId, name: mn, slug: slugify(`${slugify(brandName)}-${mn}`), catId: catMap[catSlug] });
    }
  }
  return rows;
}

const carRows = buildRows(carData, 'sedan');
const mcRows = buildRows(mcData, 'motorcycles');

const BATCH = 100;

// Insert cars
let total = 0;
for (let i = 0; i < carRows.length; i += BATCH) {
  const batch = carRows.slice(i, i + BATCH);
  const vals = batch.map((_, j) => `($${j*4+1},$${j*4+2},$${j*4+3},$${j*4+4},true,NOW(),NOW())`).join(',');
  const params = batch.flatMap(m => [m.brandId, m.name, m.slug, m.catId]);
  await pool.query(`INSERT INTO vehicle_models (brand_id,name,slug,category_id,is_active,created_at,updated_at) VALUES ${vals} ON CONFLICT (slug) DO NOTHING`, params);
  total += batch.length;
}
console.log(`[OK] cars: ${total}`);

// Insert motorcycles
total = 0;
for (let i = 0; i < mcRows.length; i += BATCH) {
  const batch = mcRows.slice(i, i + BATCH);
  const vals = batch.map((_, j) => `($${j*4+1},$${j*4+2},$${j*4+3},$${j*4+4},true,NOW(),NOW())`).join(',');
  const params = batch.flatMap(m => [m.brandId, m.name, m.slug, m.catId]);
  await pool.query(`INSERT INTO vehicle_models (brand_id,name,slug,category_id,is_active,created_at,updated_at) VALUES ${vals} ON CONFLICT (slug) DO NOTHING`, params);
  total += batch.length;
}
console.log(`[OK] mcs: ${total}`);

// Brand-Categories
const carSlugs = new Set(carData.filter(e => e.brand.trim()).map(e => slugify(e.brand.trim())));
const mcSlugs = new Set(mcData.filter(e => e.brand.trim()).map(e => slugify(e.brand.trim())));
const commNames = ['آتین خودرو دیزل','آذرخش','آران ماشین','آرتابان دیزل','آرشام دیزل','آرنا پلاس','آریا','آریا آکام','آریا صنعت آذربایجان','آکوفیدار','آکیا','آلیس چالمرز','آمیکو','ابراهیم','اروم','اروم سرما','اس دی ال جی (SDLG)','اس دی ای سی (SDAC)','استریک','اسکانیا','اسنو پارس','اشمیتز','اطلس دویتز','البرز','الوند','امپاور','اوجا آرکا گستر','ایران خودرو دیزل','ایران رخش','ایران کاوه','ایسوزو','ایفا','ایکس جی ام ای (XGMA)','ایکس سی ام جی (XCMG)','اینترنشنال','ایویکو','بابکت','بایک','بروک وی','بونیز','بی ام سی (BMC)','بی بن','پانیذ','پوکلن','پویا خودرو ماهان','پویا صنعت کردستان','پیشرو دیزل','پیلسان دیزل','تایتان','ترکس','توحید صنعت','توماس','تویوتا','تی دی ال (TDL)','تیراژه ماشین','تیرکس','تیکا','جک','جی ام سی (GMC)','جی ام سی (JMC)','جی سی بی (JCB)','جیران صنعت','چانگلین','حنیفرام','خاور','داف','دافران','دانگ فنگ','دایون','درستا','دلتا راه ماشین','دوسان','دوو','راگا','رنو','روور','زاگرس','زامیاد','زرین کوپال','زوم لاین','زیل','ژانگ تانگ','سانوارد','سانی','سبلان خودرو','سپاهان ماشین','سهند','سی اند سی (C&C)','سیترا','سینوتراک','شاپور','شاد خودرو','شاکمان','شانتوی','شک موتو','شورولت','شیلر','طارق','عقاب افشان','فاو','فراز','فردا دیزل','فردا ماشین','فرداد پایش','فوتون','فوتون لوول','فورس','فوروکاوا','فوریوز','فوسو','فولکس واگن','فیات','فیات آلیس','کارسان','کاشان صنعت','کالابرس','کالمار','کاما','کاماز','کامل دیزل','کاوازاکی','کاوه','کاویان','کترپیلار','کوبلکو','کوگل','کوماتسو','کیا','کیس','کینگ','گاز','گازار','گلدهوفر','لیبهر','لیلاند','لیوگانگ','مارال','ماز','ماک','ماموت','مان','مایان','مبارز','مرسدس بنز','مکسوس','مهران سرد','میرمحمد','نئوپلان','نصف جهان','نوین دیزل','نیو هالند','وایت','وزین','ولوو','هپکو','هرون','هلیکو','هیتاچی','هیدرومک','هیوندای','یاقوت','یوتانگ','یوجین'];
const commSlugs = new Set(commNames.map(n => slugify(n.trim())));

const bcPairs = [];
for (const b of allBrands) {
  if (carSlugs.has(b.slug)) bcPairs.push({ bid: b.id, cid: catMap['sedan'] });
  if (mcSlugs.has(b.slug)) bcPairs.push({ bid: b.id, cid: catMap['motorcycles'] });
  if (commSlugs.has(b.slug)) bcPairs.push({ bid: b.id, cid: catMap['truck'] });
}
for (let i = 0; i < bcPairs.length; i += BATCH) {
  const batch = bcPairs.slice(i, i + BATCH);
  const vals = batch.map((_, j) => `($${j*2+1},$${j*2+2})`).join(',');
  const params = batch.flatMap(t => [t.bid, t.cid]);
  await pool.query(`INSERT INTO brand_categories VALUES ${vals} ON CONFLICT DO NOTHING`, params);
}
console.log(`[OK] brand_categories: ${bcPairs.length}`);

// Verify
const [{ rows: counts }, { rows: bcCounts }] = await Promise.all([
  pool.query(`SELECT c.slug, COUNT(DISTINCT vm.id) AS models FROM vehicle_models vm JOIN categories c ON c.id=vm.category_id GROUP BY c.slug ORDER BY c.slug`),
  pool.query(`SELECT c.slug, COUNT(*) AS brands FROM brand_categories bc JOIN categories c ON c.id=bc.category_id GROUP BY c.slug ORDER BY c.slug`),
]);
console.table(counts);
console.table(bcCounts);
await pool.end();
