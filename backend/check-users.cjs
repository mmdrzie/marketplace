const { Client } = require('pg');
async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPLOh@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const res = await client.query("SELECT email, role, deleted_at, password_hash IS NOT NULL as has_hash FROM users WHERE email LIKE '%@marketplace.com' ORDER BY email");
  console.table(res.rows);
  await client.end();
}
main().catch(console.error);
