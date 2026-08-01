import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});

const brands = await pool.query("SELECT COUNT(*) as c FROM brands WHERE deleted_at IS NULL");
console.log('brands:', brands.rows[0].c);

const models = await pool.query("SELECT COUNT(*) as c FROM vehicle_models WHERE deleted_at IS NULL");
console.log('models:', models.rows[0].c);

const top = await pool.query(`
  SELECT b.name, COUNT(vm.id) as model_count
  FROM brands b
  LEFT JOIN vehicle_models vm ON vm.brand_id = b.id AND vm.deleted_at IS NULL
  WHERE b.deleted_at IS NULL
  GROUP BY b.id, b.name
  ORDER BY model_count DESC
  LIMIT 10
`);
console.log('Top brands by model count:');
top.rows.forEach(r => console.log(`  ${r.name}: ${r.model_count} models`));

const peugeot = await pool.query("SELECT id, name, slug FROM brands WHERE name LIKE '%پژو%'");
console.log('پژو brand:', JSON.stringify(peugeot.rows[0]));

const sample = await pool.query(`
  SELECT b.name, vm.name as model
  FROM brands b
  JOIN vehicle_models vm ON vm.brand_id = b.id AND vm.deleted_at IS NULL
  WHERE b.id = $1
  ORDER BY vm.name
  LIMIT 8
`, [peugeot.rows[0].id]);
console.log('Sample models for پژو:');
sample.rows.forEach(r => console.log(`  > ${r.model}`));

const noModel = await pool.query("SELECT name FROM brands b WHERE b.deleted_at IS NULL AND NOT EXISTS (SELECT 1 FROM vehicle_models vm WHERE vm.brand_id = b.id AND vm.deleted_at IS NULL)");
console.log('Brands with no models:', noModel.rows.length);
noModel.rows.forEach(r => console.log(`  - ${r.name}`));

await pool.end();
