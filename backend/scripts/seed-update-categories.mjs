import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

// Helper: slugify Persian to Latin
function slugifyPersian(text) {
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

// 1. Update existing categories under vehicles
// Rename سواری → سدان
await pool.query("UPDATE categories SET name = 'سدان' WHERE slug = 'sedan'");
console.log('[OK] rename سواری → سدان');

// Rename ون تجاری → ون
await pool.query("UPDATE categories SET name = 'ون', slug = 'van' WHERE slug = 'vn-tjary'");
console.log('[OK] rename ون تجاری → ون');

// Update slug for اتوبوس from 'atvbvs' to 'bus'
await pool.query("UPDATE categories SET name_en = 'Bus', slug = 'bus' WHERE slug = 'atvbvs'");
// Update slug for مینی بوس
await pool.query("UPDATE categories SET slug = 'minibus' WHERE slug = 'myny-bvs'");
console.log('[OK] fix bus/minibus slugs');

// 2. Add new subcategories under vehicles (id=13)
const newCats = [
  { name: 'هاچبک', nameEn: 'Hatchback', slug: 'hatchback', sort: 3 },
  { name: 'کراس اور', nameEn: 'Crossover', slug: 'crossover', sort: 4 },
  { name: 'کوپه', nameEn: 'Coupe', slug: 'coupe', sort: 5 },
  { name: 'کروک', nameEn: 'Convertible', slug: 'convertible', sort: 6 },
  { name: 'کلاسیک', nameEn: 'Classic', slug: 'classic', sort: 7 },
];
for (const c of newCats) {
  await pool.query(
    `INSERT INTO categories (name, name_en, slug, icon, parent_id, sort_order)
     VALUES ($1, $2, $3, 'car', 13, $4) ON CONFLICT (slug) DO NOTHING`,
    [c.name, c.nameEn, c.slug, c.sort]
  );
}
console.log(`[OK] ${newCats.length} new vehicle subcategories`);

// 3. Add تراکتور under agricultural-machinery (id=15)
await pool.query(
  `INSERT INTO categories (name, name_en, slug, icon, parent_id, sort_order)
   VALUES ('تراکتور', 'Tractor', 'tractor', 'tractor', 15, 1) ON CONFLICT (slug) DO NOTHING`
);
console.log('[OK] tractor under agricultural');

// 4. Add motorcycle subcategories (parent id=17)
const mcCats = [
  { name: 'استریت', nameEn: 'Street', slug: 'street', sort: 1 },
  { name: 'آفرود', nameEn: 'Off-road', slug: 'off-road', sort: 2 },
  { name: 'ریس', nameEn: 'Race', slug: 'race', sort: 3 },
  { name: 'اسکوتر', nameEn: 'Scooter', slug: 'scooter', sort: 4 },
  { name: 'کروزر', nameEn: 'Cruiser', slug: 'cruiser', sort: 5 },
];
for (const c of mcCats) {
  await pool.query(
    `INSERT INTO categories (name, name_en, slug, icon, parent_id, sort_order)
     VALUES ($1, $2, $3, 'motorcycle', 17, $4) ON CONFLICT (slug) DO NOTHING`,
    [c.name, c.nameEn, c.slug, c.sort]
  );
}
console.log(`[OK] ${mcCats.length} motorcycle subcategories`);

// 5. Fix sort orders for remaining vehicle subcategories
await pool.query("UPDATE categories SET sort_order = 1 WHERE slug = 'sedan'");
await pool.query("UPDATE categories SET sort_order = 2 WHERE slug = 'suv'");
await pool.query("UPDATE categories SET sort_order = 8 WHERE slug = 'pickup'");
await pool.query("UPDATE categories SET sort_order = 9 WHERE slug = 'van'");
console.log('[OK] sort orders updated');

// Show result
const { rows } = await pool.query(`
  SELECT c.id, c.name, c.slug, c.sort_order, p.name AS parent
  FROM categories c
  LEFT JOIN categories p ON p.id = c.parent_id
  ORDER BY COALESCE(p.sort_order,0), c.parent_id, c.sort_order
`);
console.table(rows);
await pool.end();
