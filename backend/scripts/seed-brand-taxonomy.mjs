import { config as dotenvConfig } from 'dotenv';
import pg from 'pg';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenvConfig({ path: resolve(__dirname, '../.env') });
const { Pool } = pg;

// ─── DB connection from project config ───
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
});

// ─── Slugify (mirrors backend's Persian→Latin slug) ───
function slugify(text) {
  const m = {
    ' ': '-', '‌': '-', 'آ': 'a', 'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
    'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z',
    'ژ': 'zh', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
    'ع': '', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm',
    'ن': 'n', 'و': 'v', 'ه': 'h', 'ی': 'y', 'ئ': 'y',
    '0': '0','1': '1','2': '2','3': '3','4': '4','5': '5','6': '6','7': '7','8': '8','9': '9',
    '(': '', ')': '', '[': '', ']': '', '.': '-', '×': 'x',
  };
  let r = '';
  for (const ch of text.toLowerCase().trim()) r += m[ch] || (ch.match(/[a-z0-9\-]/) ? ch : '');
  return r.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ─── Load taxonomy JSON ───
const taxPath = resolve(__dirname, '../../nextjs-frontend/src/lib/taxonomy-data.json');
const taxonomy = JSON.parse(readFileSync(taxPath, 'utf-8'));
console.log('[OK] taxonomy loaded:', Object.keys(taxonomy).join(', '));

// ─── Load DB data ───
const [{ rows: brands }, { rows: cats }, { rows: models }] = await Promise.all([
  pool.query('SELECT id, name, slug FROM brands WHERE deleted_at IS NULL'),
  pool.query('SELECT id, slug, name, parent_id FROM categories'),
  pool.query('SELECT vm.id, vm.brand_id, b.slug AS brand_slug FROM vehicle_models vm JOIN brands b ON b.id = vm.brand_id WHERE vm.deleted_at IS NULL'),
]);
console.log(`[OK] brands: ${brands.length}, categories: ${cats.length}, models: ${models.length}`);

// ─── Build brand map: slug → id ───
const brandMap = {};
for (const b of brands) {
  brandMap[b.slug] = b.id;
  const ns = slugify(b.name);
  if (ns && ns !== b.slug && !brandMap[ns]) brandMap[ns] = b.id;
}

// ─── Build category tree ───
const catMap = {};
const catChildren = {};
for (const c of cats) {
  catMap[c.slug] = c.id;
  if (c.parent_id) {
    if (!catChildren[c.parent_id]) catChildren[c.parent_id] = [];
    catChildren[c.parent_id].push(c);
  }
}

function resolveDescendantIds(parentSlug) {
  const pid = catMap[parentSlug];
  if (!pid) return [];
  const ids = [pid];
  const queue = [pid];
  while (queue.length) {
    const id = queue.shift();
    for (const child of (catChildren[id] || [])) {
      ids.push(child.id);
      queue.push(child.id);
    }
  }
  return ids;
}

// ─── Category groups (parent slugs, auto-include all descendants) ───
const PASSENGER_PARENTS = ['vehicles'];
const MOTORCYCLE_PARENTS = ['motorcycles'];
const COMMERCIAL_PARENTS = ['truck', 'bus-van', 'trailer', 'light-truck', 'tractor-head', 'construction-machinery', 'agricultural-machinery', 'industrial-machinery'];

const passengerCatIds = new Set(PASSENGER_PARENTS.flatMap(s => resolveDescendantIds(s)));
const motorcycleCatIds = new Set(MOTORCYCLE_PARENTS.flatMap(s => resolveDescendantIds(s)));
const commercialCatIds = new Set(COMMERCIAL_PARENTS.flatMap(s => resolveDescendantIds(s)));

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
let unmatchedBrands = 0;

for (const { keys, catIds } of JSON_CAT_MAP) {
  for (const key of keys) {
    const section = taxonomy[key];
    if (!section) continue;
    for (const brand of section.brands) {
      const brandId = brandMap[slugify(brand.name)];
      if (!brandId) { unmatchedBrands++; continue; }
      for (const cid of catIds) {
        const pk = `${brandId}:${cid}`;
        if (!seen.has(pk)) { seen.add(pk); bcPairs.push({ bid: brandId, cid }); }
      }
    }
  }
}

console.log(`[OK] brand-category pairs: ${bcPairs.length}, unmatched brands in JSON: ${unmatchedBrands}`);

// ─── Clear & insert brand_categories ───
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
console.log(`[OK] brand_categories inserted: ${inserted}`);

// ─── Set vehicle_models.category_id based on brand → category mapping ───
const firstCatPerBrand = {};
for (const pair of bcPairs) {
  if (!firstCatPerBrand[pair.bid]) firstCatPerBrand[pair.bid] = pair.cid;
}
// Build a mapping table using VALUES + JOIN in a single bulk UPDATE
const updatePairs = [];
for (const m of models) {
  const catId = firstCatPerBrand[m.brand_id];
  if (catId) updatePairs.push({ mid: m.id, cid: catId });
}
const UPD_BATCH = 500;
let modelUpdated = 0;
for (let i = 0; i < updatePairs.length; i += UPD_BATCH) {
  const batch = updatePairs.slice(i, i + UPD_BATCH);
  const vals = batch.map((_, j) => `($${j * 2 + 1}::BIGINT, $${j * 2 + 2}::BIGINT)`).join(',');
  const params = batch.flatMap(t => [t.cid, t.mid]);
  await pool.query(
    `UPDATE vehicle_models vm SET category_id = x.cat_id
     FROM (VALUES ${vals}) AS x(cat_id, model_id)
     WHERE vm.id = x.model_id AND vm.category_id IS NULL`,
    params
  );
  modelUpdated += batch.length;
}
console.log(`[OK] vehicle_models category_id set: ${modelUpdated}`);

// ─── Verify ───
const { rows: counts } = await pool.query(
  `SELECT c.slug, c.name, COUNT(*) AS brands
   FROM brand_categories bc JOIN categories c ON c.id = bc.category_id
   GROUP BY c.slug, c.name ORDER BY c.slug`
);
console.table(counts);

const { rows: modelCounts } = await pool.query(
  `SELECT c.slug, COUNT(vm.id) AS models
   FROM vehicle_models vm JOIN categories c ON c.id = vm.category_id
   GROUP BY c.slug ORDER BY c.slug`
);
console.table(modelCounts);

await pool.end();
