import pg from 'pg';
import { readFileSync } from 'fs';

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

const data = JSON.parse(readFileSync('C:\\Users\\MR\\Desktop\\New Text Document (5).txt', 'utf-8'));

// Batch insert brands
const brandRows = data
  .filter((e) => e.brand.trim())
  .map((e) => ({ name: e.brand.trim(), slug: slugify(e.brand.trim()) }));

const brandValues = brandRows.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2}, true, NOW(), NOW())`).join(',');
const brandParams = brandRows.flatMap((b) => [b.name, b.slug]);
const brandRes = await pool.query(
  `INSERT INTO brands (name, slug, is_active, created_at, updated_at)
   VALUES ${brandValues}
   ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
   RETURNING id, slug`,
  brandParams
);
const brandMap = {};
for (const row of brandRes.rows) brandMap[row.slug] = row.id;
console.log(`brands: ${Object.keys(brandMap).length}`);

// Batch insert models
const modelRows = [];
for (const entry of data) {
  const brandName = entry.brand.trim();
  if (!brandName) continue;
  const brandSlug = slugify(brandName);
  const brandId = brandMap[brandSlug];
  if (!brandId) continue;
  for (const modelFullName of entry.models || []) {
    let modelName = modelFullName.trim();
    if (modelName.startsWith(brandName)) modelName = modelName.slice(brandName.length).trim();
    modelName = modelName.replace(/^[\s\-]+/, '').trim();
    if (!modelName) continue;
    modelRows.push({ brandId, name: modelName, slug: slugify(`${brandSlug}-${modelName}`) });
  }
}

const BATCH = 50;
let inserted = 0;
for (let i = 0; i < modelRows.length; i += BATCH) {
  const batch = modelRows.slice(i, i + BATCH);
  const vals = batch.map((_, j) => `($${j * 3 + 1}, $${j * 3 + 2}, $${j * 3 + 3}, true, NOW(), NOW())`).join(',');
  const params = batch.flatMap((m) => [m.brandId, m.name, m.slug]);
  await pool.query(
    `INSERT INTO vehicle_models (brand_id, name, slug, is_active, created_at, updated_at)
     VALUES ${vals} ON CONFLICT (slug) DO NOTHING`,
    params
  );
  inserted += batch.length;
  process.stdout.write(`\rmodels: ${inserted}/${modelRows.length}`);
}
console.log(`\ntotal models: ${modelRows.length}`);
await pool.end();
