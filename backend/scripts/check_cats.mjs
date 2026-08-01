import pg from 'pg';
const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
});
const { rows } = await pool.query(
  'SELECT c.slug, c.name, p.slug AS parent_slug, p.name AS parent_name FROM categories c LEFT JOIN categories p ON p.id = c.parent_id WHERE c.slug = ANY($1)',
  [['truck','bus','minibus','van','kamyvnt-khavr','kshndh-tk-mhvr','kshndh-dv-mhvr']]
);
for (const r of rows) {
  console.log(r.slug, '-', r.name, '-> parent:', r.parent_slug, '-', r.parent_name);
}
await pool.end();
