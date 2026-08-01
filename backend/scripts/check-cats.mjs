import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 1,
});
const { rows } = await pool.query("SELECT id, slug, name, parent_id, sort_order FROM categories ORDER BY coalesce(parent_id,0), sort_order");
for (const r of rows) {
  const indent = r.parent_id ? '  ' : '';
  console.log(`${indent}${r.slug} (${r.name}) id=${r.id} parent=${r.parent_id}`);
}
await pool.end();
