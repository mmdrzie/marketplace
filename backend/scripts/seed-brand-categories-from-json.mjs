import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
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

// ─── Load taxonomy JSON ───
const taxonomyPath = resolve(__dirname, '../../nextjs-frontend/src/lib/taxonomy-data.json');
const taxonomy = JSON.parse(readFileSync(taxonomyPath, 'utf-8'));
console.log('[OK] taxonomy loaded:', Object.keys(taxonomy).join(', '));

// ─── Load DB data ───
const [{ rows: allBrands }, { rows: allCats }] = await Promise.all([
  pool.query('SELECT id, name, slug FROM brands WHERE deleted_at IS NULL'),
  pool.query('SELECT id, slug, name, parent_id FROM categories'),
]);
console.log(`[OK] brands: ${allBrands.length}, categories: ${allCats.length}`);

// Build brand map: slug → id (check both DB slug + slugified Persian name)
const brandMap = {};
for (const b of allBrands) {
  brandMap[b.slug] = b.id;
  const nameSlug = slugify(b.name);
  if (nameSlug && nameSlug !== b.slug && !brandMap[nameSlug]) brandMap[nameSlug] = b.id;
}

const catMap = {};
const catChildren = {};
for (const c of allCats) {
  catMap[c.slug] = c.id;
  if (c.parent_id) {
    if (!catChildren[c.parent_id]) catChildren[c.parent_id] = [];
    catChildren[c.parent_id].push(c);
  }
}

// ─── Resolve descendant category IDs for a given parent slug ───
function resolveDescendantIds(parentSlug) {
  const parentId = catMap[parentSlug];
  if (!parentId) return [];
  const ids = [parentId];
  const queue = [parentId];
  while (queue.length > 0) {
    const pid = queue.shift();
    for (const child of (catChildren[pid] || [])) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }
  return ids;
}

// ─── Category groups (parent slugs that auto-include all descendants) ───
const PASSENGER_PARENT_SLUGS = ['vehicles'];
const MOTORCYCLE_PARENT_SLUGS = ['motorcycles'];
const COMMERCIAL_PARENT_SLUGS = ['truck', 'bus-van', 'trailer', 'light-truck', 'tractor-head', 'construction-machinery', 'agricultural-machinery', 'industrial-machinery'];

const passengerCatIds = new Set(PASSENGER_PARENT_SLUGS.flatMap(s => resolveDescendantIds(s)));
const motorcycleCatIds = new Set(MOTORCYCLE_PARENT_SLUGS.flatMap(s => resolveDescendantIds(s)));
const commercialCatIds = new Set(COMMERCIAL_PARENT_SLUGS.flatMap(s => resolveDescendantIds(s)));

console.log(`passenger cats: ${passengerCatIds.size}, motorcycle cats: ${motorcycleCatIds.size}, commercial cats: ${commercialCatIds.size}`);

// ─── Map JSON sections → category ID sets ───
const JSON_CAT_MAP = [
  { keys: ['sedan', 'vehicles'], catIds: passengerCatIds },
  { keys: ['motorcycles'], catIds: motorcycleCatIds },
  { keys: ['truck', 'light-truck', 'tractor-head'], catIds: commercialCatIds },
];

// ─── Build brand_category pairs ───
const bcPairs = [];
const seen = new Set();

for (const { keys, catIds } of JSON_CAT_MAP) {
  for (const key of keys) {
    const section = taxonomy[key];
    if (!section) { console.log(`[SKIP] taxonomy section not found: ${key}`); continue; }
    for (const brand of section.brands) {
      const brandId = brandMap[slugify(brand.name)];
      if (!brandId) continue;
      for (const cid of catIds) {
        const pairKey = `${brandId}:${cid}`;
        if (!seen.has(pairKey)) {
          seen.add(pairKey);
          bcPairs.push({ bid: brandId, cid });
        }
      }
    }
  }
}

console.log(`[OK] total brand-category pairs: ${bcPairs.length}`);

// ─── Clear & insert ───
await pool.query('DELETE FROM brand_categories');

const BATCH = 200;
let inserted = 0;
for (let i = 0; i < bcPairs.length; i += BATCH) {
  const batch = bcPairs.slice(i, i + BATCH);
  const vals = batch.map((_, j) => `($${j * 2 + 1}, $${j * 2 + 2})`).join(',');
  const params = batch.flatMap(t => [t.bid, t.cid]);
  await pool.query(`INSERT INTO brand_categories VALUES ${vals} ON CONFLICT DO NOTHING`, params);
  inserted += batch.length;
}
console.log(`[OK] inserted ${inserted} pairs`);

// ─── Verify ───
const { rows: counts } = await pool.query(
  `SELECT c.slug, c.name, COUNT(*) AS brands
   FROM brand_categories bc JOIN categories c ON c.id = bc.category_id
   GROUP BY c.slug, c.name ORDER BY c.slug`
);
console.table(counts);

await pool.end();
