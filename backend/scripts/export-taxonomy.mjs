import pg from 'pg';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 3,
});

async function main() {
  // Load ALL categories
  const { rows: allCategories } = await pool.query(
    "SELECT id, slug, name, parent_id FROM categories ORDER BY parent_id NULLS FIRST, sort_order"
  );

  // Load brand_categories: which brands go in which category
  const { rows: brandCats } = await pool.query(
    `SELECT bc.brand_id, bc.category_id, b.name as brand_name
     FROM brand_categories bc
     JOIN brands b ON b.id = bc.brand_id
     WHERE b.deleted_at IS NULL AND b.is_active = true`
  );

  // Build map: category_id -> Set<brand_id>
  const brandsByCat = {};
  const brandNames = {};
  for (const bc of brandCats) {
    if (!brandsByCat[bc.category_id]) brandsByCat[bc.category_id] = new Set();
    brandsByCat[bc.category_id].add(bc.brand_id);
    brandNames[bc.brand_id] = bc.brand_name;
  }

  // Build map: category_id -> children ids
  const childrenByParent = {};
  const catInfo = {};
  for (const c of allCategories) {
    catInfo[c.id] = { slug: c.slug, name: c.name, parentId: c.parent_id };
    if (c.parent_id) {
      if (!childrenByParent[c.parent_id]) childrenByParent[c.parent_id] = [];
      childrenByParent[c.parent_id].push(c.id);
    }
  }

  // Recursively collect brand_ids from a category and all its descendants
  function collectBrandIds(catId) {
    const ids = new Set(brandsByCat[catId] || []);
    const children = childrenByParent[catId] || [];
    for (const childId of children) {
      for (const bid of collectBrandIds(childId)) {
        ids.add(bid);
      }
    }
    return ids;
  }

  // Load all models grouped by (brand_id, category_id)
  const { rows: allModels } = await pool.query(
    `SELECT vm.brand_id, vm.category_id, vm.name
     FROM vehicle_models vm
     WHERE vm.deleted_at IS NULL AND vm.is_active = true
     ORDER BY vm.name`
  );
  const modelsKey = {};
  for (const m of allModels) {
    const key = `${m.brand_id}:${m.category_id}`;
    if (!modelsKey[key]) modelsKey[key] = [];
    modelsKey[key].push(m.name);
  }

  // Build result: for each category that has brands (self or inherited), collect brand -> models
  const result = {};
  for (const c of allCategories) {
    const brandIds = collectBrandIds(c.id);
    if (brandIds.size === 0) continue;

    // For each brand, get models applicable to this category or its descendants
    const brandList = [];
    for (const bid of brandIds) {
      // Collect models from all relevant (brand, category) combos
      const modelSet = new Set();
      // Check direct category
      const directModels = modelsKey[`${bid}:${c.id}`] || [];
      for (const m of directModels) modelSet.add(m);
      // Check children categories
      const children = childrenByParent[c.id] || [];
      for (const childId of children) {
        const childModels = modelsKey[`${bid}:${childId}`] || [];
        for (const m of childModels) modelSet.add(m);
      }

      brandList.push({
        name: brandNames[bid],
        models: Array.from(modelSet).sort(),
      });
    }

    brandList.sort((a, b) => a.name.localeCompare(b.name));
    result[c.slug] = { name: c.name, brands: brandList };

    const totalModels = brandList.reduce((acc, b) => acc + b.models.length, 0);
    console.log(`[OK] ${c.slug} (${c.name}): ${brandList.length} brands, ${totalModels} models`);
  }

  const outputPath = join(__dirname, 'taxonomy-data.json');
  writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\n✅ Written to ${outputPath}`);

  await pool.end();
}

main().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
