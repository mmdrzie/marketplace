import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'
});
await client.connect();
try {
  const tables = ['content_types','content_categories','content_tags','content_tag_map','content_links','content_relations','user_saved_contents'];
  for (const t of tables) {
    const { rows } = await client.query(`SELECT to_regclass('${t}') AS exists`);
    console.log(`${t}: ${rows[0].exists ? '✅' : '❌'}`);
  }
  const cols = ['content_type_id','category_id','author_id','status','meta_title','meta_description','canonical_url','og_image','robots','extra_seo','difficulty','scheduled_at'];
  for (const c of cols) {
    const { rows } = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='articles' AND column_name='${c}'`);
    console.log(`articles.${c}: ${rows.length ? '✅' : '❌'}`);
  }
  const { rows: types } = await client.query('SELECT slug, label FROM content_types ORDER BY sort_order');
  console.log('\ncontent_types:', types.map(r => `${r.slug}(${r.label})`).join(', '));
  const { rows: backfill } = await client.query("SELECT COUNT(*)::int AS cnt FROM articles WHERE content_type_id = (SELECT id FROM content_types WHERE slug = 'news')");
  console.log(`\narticles backfilled: ${backfill[0].cnt}`);
} finally {
  await client.end();
}