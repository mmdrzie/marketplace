import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});
const { rows } = await pool.query(
  "SELECT slug, name, parent_id FROM categories WHERE slug IN ('kamyvnt-khavr','tractor-head','bus-van','light-truck','trailer')"
);
for (const r of rows) {
  console.log(r.slug, '-', r.name, '-> parent_id:', r.parent_id);
}
// Also list all unique parent_ids and their names
const { rows: parents } = await pool.query(
  "SELECT DISTINCT c.slug, c.name, c.parent_id FROM categories c WHERE c.slug IN ('truck','bus-van','tractor-head','light-truck','trailer','vehicles','construction-machinery','agricultural-machinery','industrial-machinery','motorcycles','parts') ORDER BY c.slug"
);
for (const r of parents) {
  console.log('PARENT:', r.slug, '-', r.name, '-> grandparent:', r.parent_id);
}
await pool.end();
