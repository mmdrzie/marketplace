import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 1,
});
const { rows } = await pool.query("SELECT id, slug, name, parent_id FROM categories ORDER BY parent_id NULLS FIRST, sort_order");
for (const r of rows) {
  const indent = r.parent_id ? '  ' : '';
  console.log(indent + r.slug);
}
await pool.end();
