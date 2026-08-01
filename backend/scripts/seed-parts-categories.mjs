import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 3,
});

const PART_TYPES = [
  { name: 'قطعات موتور', slug: 'engine', icon: 'engine' },
  { name: 'قطعات گیربکس', slug: 'transmission', icon: 'gearbox' },
  { name: 'قطعات ترمز', slug: 'brake', icon: 'brake' },
  { name: 'قطعات بدنه', slug: 'body', icon: 'car-body' },
  { name: 'قطعات تعلیق', slug: 'suspension', icon: 'suspension' },
  { name: 'قطعات برقی', slug: 'electrical', icon: 'electrical' },
  { name: 'قطعات خنک‌کننده', slug: 'cooling', icon: 'cooling' },
  { name: 'قطعات سوخت‌رسانی', slug: 'fuel', icon: 'fuel' },
  { name: 'قطعات اگزوز', slug: 'exhaust', icon: 'exhaust' },
  { name: 'قطعات فرمان', slug: 'steering', icon: 'steering' },
  { name: 'قطعات تهویه', slug: 'ac', icon: 'ac' },
  { name: 'لاستیک و رینگ', slug: 'tires', icon: 'tire' },
  { name: 'روغن و سیالات', slug: 'fluids', icon: 'oil' },
  { name: 'لوازم جانبی', slug: 'accessories', icon: 'accessory' },
];

const VEHICLE_TYPES = [
  { name: 'خودرو', slug: 'car', order: 1 },
  { name: 'کامیون', slug: 'truck', order: 2 },
  { name: 'موتورسیکلت', slug: 'motorcycle', order: 3 },
  { name: 'ماشین‌آلات راه‌سازی', slug: 'construction', order: 4 },
  { name: 'ماشین‌آلات کشاورزی', slug: 'agricultural', order: 5 },
];

async function main() {
  console.log('[START] Seeding parts categories...');
  await pool.query('DELETE FROM parts_categories');

  for (const vt of VEHICLE_TYPES) {
    const vtRes = await pool.query(
      `INSERT INTO parts_categories (parent_id, name, slug, icon, description, sort_order)
       VALUES (NULL, $1, $2, $3, $4, $5) RETURNING id`,
      [vt.name, vt.slug, `vehicle-${vt.slug}`, `قطعات یدکی ${vt.name}`, vt.order]
    );
    const vtId = vtRes.rows[0].id;
    console.log(`  [OK] ${vt.name} (id=${vtId})`);

    for (let i = 0; i < PART_TYPES.length; i++) {
      const pt = PART_TYPES[i];
      const childSlug = `${vt.slug}-${pt.slug}`;
      await pool.query(
        `INSERT INTO parts_categories (parent_id, name, slug, icon, description, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [vtId, `${pt.name} ${vt.name}`, childSlug, pt.icon, `${pt.name} مربوط به ${vt.name}`, i + 1]
      );
    }
    console.log(`  [OK] ${PART_TYPES.length} subcategories for ${vt.name}`);
  }

  console.log('[DONE] Parts categories seeded!');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
