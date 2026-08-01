// seed-catalog-accessory.mts
// Idempotent seed for the accessory/decor catalog (generic catalog domain).
// - catalog_types.accessory → is_public = true
// - catalog_categories: 3-level tree (vehicle → group → part type), path/depth via DB triggers
// - Parts: accessory parts in `parts` (universal part type) + compatibility
import 'dotenv/config';
import pg from 'pg';
import { config } from '../src/config/index.js';

const pool = new pg.Pool({ connectionString: config.database.url, ssl: { rejectUnauthorized: false }, max: 5 });

const CATALOG = 'accessory';

const GROUPS = {
  interior: {
    title: 'داخل کابین',
    types: [
      ['seat-cover', 'روکش صندلی'], ['floor-mat', 'کفپوش'], ['steering-cover', 'روکش فرمان'],
      ['dash-decor', 'تزئینات داشبورد'], ['air-freshener', 'خوشبوکننده'], ['rear-camera', 'دوربین دنده عقب'],
    ],
  },
  exterior: {
    title: 'بدنه و بیرون',
    types: [
      ['sticker', 'استیکر و برچسب'], ['chrome-trim', 'تریم کروم'], ['wheel-cap', 'کاور رینگ'],
      ['mud-flap', 'گلگیر'], ['sun-visor', 'سایه‌بان پنجره'],
    ],
  },
  lighting: {
    title: 'نورپردازی',
    types: [
      ['led-strip', 'نوار LED'], ['led-bulb', 'لامپ LED'], ['fog-light', 'مه‌شکن'],
      ['interior-light', 'نور کابین'],
    ],
  },
  protection: {
    title: 'محافظت',
    types: [
      ['car-cover', 'روکش خودرو'], ['bumper-guard', 'محافظ سپر'], ['seat-protector', 'محافظ صندلی'],
      ['trunk-mat', 'تشک صندوق'], ['door-guard', 'محافظ لبه درب'],
    ],
  },
  gadgets: {
    title: 'لوازم الکترونیکی',
    types: [
      ['phone-holder', 'نگهدارنده موبایل'], ['car-charger', 'شارژر فندکی'],
      ['dash-cam', 'داشکم'], ['car-vacuum', 'جاروبرقی'],
    ],
  },
  'rider-gear': {
    title: 'تجهیزات موتورسوار',
    types: [
      ['helmet', 'کلاه ایمنی'], ['gloves', 'دستکش'], ['riding-jacket', 'کت و شلوار'],
      ['intercom', 'اینترکام'],
    ],
  },
  storage: {
    title: 'کیسه و جانبی',
    types: [
      ['tank-bag', 'کیسه باک'], ['saddle-bag', 'کیسه جانبی'], ['top-case', 'باکس عقب'],
    ],
  },
  decor: {
    title: 'تزئینات موتور',
    types: [
      ['mc-sticker', 'استیکر'], ['mc-led-strip', 'نوار LED'], ['mc-mirror', 'آینه'],
    ],
  },
};

const VEHICLES = {
  car: { title: 'خودرو', groups: ['interior', 'exterior', 'lighting', 'protection', 'gadgets'] },
  motorcycle: { title: 'موتورسیکلت', groups: ['rider-gear', 'storage', 'decor'] },
};

const P = (name, path, brand, oem) => ({ name, path, brand, oem });

const PARTS = [
  // ---- car: interior
  P('روکش صندلی چرم', 'car/interior/seat-cover', 'اپل', 'AC-SC-001'),
  P('کفپوش محفظه‌دار', 'car/interior/floor-mat', 'اپل', 'AC-FM-001'),
  P('روکش فرمان چرم', 'car/interior/steering-cover', 'پژو', 'AC-ST-001'),
  P('تریم کربن داشبورد', 'car/interior/dash-decor', 'اپل', 'AC-DD-001'),
  P('خوشبوکننده خودرو', 'car/interior/air-freshener', 'هیوندای', 'AC-AF-001'),
  P('دوربین دنده عقب', 'car/interior/rear-camera', 'تویوتا', 'AC-RC-001'),
  // ---- car: exterior
  P('استیکر بدنه مات', 'car/exterior/sticker', 'اپل', 'AC-SK-001'),
  P('تریم کروم درب', 'car/exterior/chrome-trim', 'پژو', 'AC-CT-001'),
  P('کاور رینگ اسپرت', 'car/exterior/wheel-cap', 'تویوتا', 'AC-WC-001'),
  P('گلگیر بلند', 'car/exterior/mud-flap', 'پژو', 'AC-MF-001'),
  P('سایه‌بان شیشه', 'car/exterior/sun-visor', 'اپل', 'AC-SV-001'),
  // ---- car: lighting
  P('نوار LED کف خودرو', 'car/lighting/led-strip', 'اپل', 'AC-LS-001'),
  P('لامپ LED جلو', 'car/lighting/led-bulb', 'تویوتا', 'AC-LB-001'),
  P('مه‌شکن اسپرت', 'car/lighting/fog-light', 'پژو', 'AC-FL-001'),
  P('نورپردازی کابین RGB', 'car/lighting/interior-light', 'اپل', 'AC-IL-001'),
  // ---- car: protection
  P('روکش کامل خودرو', 'car/protection/car-cover', 'اپل', 'AC-CC-001'),
  P('محافظ سپر عقب', 'car/protection/bumper-guard', 'پژو', 'AC-BG-001'),
  P('محافظ صندلی کودک', 'car/protection/seat-protector', 'هیوندای', 'AC-SP-001'),
  P('تشک صندوق ضدآب', 'car/protection/trunk-mat', 'تویوتا', 'AC-TM-001'),
  P('محافظ لبه درب', 'car/protection/door-guard', 'اپل', 'AC-DG-001'),
  // ---- car: gadgets
  P('نگهدارنده موبایل مغناطیسی', 'car/gadgets/phone-holder', 'اپل', 'AC-PH-001'),
  P('شارژر فندکی دو پورت', 'car/gadgets/car-charger', 'اپل', 'AC-CH-001'),
  P('داشکم 4K', 'car/gadgets/dash-cam', 'تویوتا', 'AC-DC-001'),
  P('جاروبرقی شارژی', 'car/gadgets/car-vacuum', 'هیوندای', 'AC-CV-001'),
  // ---- motorcycle: rider gear
  P('کلاه ایمنی فول‌فیس', 'motorcycle/rider-gear/helmet', 'هوندا', 'AC-HE-001'),
  P('دستکش موتورسواری', 'motorcycle/rider-gear/gloves', 'هوندا', 'AC-GL-001'),
  P('کت و شلوار موتور', 'motorcycle/rider-gear/riding-jacket', 'هوندا', 'AC-RJ-001'),
  P('اینترکام بلوتوثی', 'motorcycle/rider-gear/intercom', 'هوندا', 'AC-IC-001'),
  // ---- motorcycle: storage
  P('کیسه باک مغناطیسی', 'motorcycle/storage/tank-bag', 'هوندا', 'AC-TB-001'),
  P('کیسه جانبی ضدآب', 'motorcycle/storage/saddle-bag', 'هوندا', 'AC-SB-001'),
  P('باکس عقب ۴۵ لیتری', 'motorcycle/storage/top-case', 'هوندا', 'AC-TC-001'),
  // ---- motorcycle: decor
  P('استیکر بدنه موتور', 'motorcycle/decor/mc-sticker', 'هوندا', 'AC-MS-001'),
  P('نوار LED چرخ', 'motorcycle/decor/mc-led-strip', 'هوندا', 'AC-ML-001'),
  P('آینه اسپرت موتور', 'motorcycle/decor/mc-mirror', 'هوندا', 'AC-MM-001'),
];

async function upsertCategory(parentId, catalogTypeId, slug, title) {
  const { rows } = await pool.query(
    `SELECT id FROM catalog_categories
     WHERE catalog_type_id = $1 AND slug = $2
       AND ($3::bigint IS NULL AND parent_id IS NULL OR parent_id = $3)
       AND deleted_at IS NULL LIMIT 1`,
    [catalogTypeId, slug, parentId]
  );
  if (rows[0]) {
    await pool.query(`UPDATE catalog_categories SET title = $1, updated_at = NOW() WHERE id = $2`, [title, rows[0].id]);
    return rows[0].id;
  }
  const { rows: ins } = await pool.query(
    `INSERT INTO catalog_categories (catalog_type_id, parent_id, slug, title, icon)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [catalogTypeId, parentId, slug, title, `vehicle-${slug}`]
  );
  return ins[0].id;
}

async function main() {
  // 1) make accessory public
  await pool.query(
    `UPDATE catalog_types SET is_public = true WHERE slug = $1`,
    [CATALOG]
  );
  console.log('[catalog_types] accessory → is_public = true');

  const [catalogTypes, brands, universalType] = await Promise.all([
    pool.query('SELECT id, slug FROM catalog_types'),
    pool.query('SELECT id, name FROM brands WHERE deleted_at IS NULL'),
    pool.query("SELECT id FROM part_types WHERE slug = 'universal'"),
  ]);
  const typeId = catalogTypes.rows.find((r) => r.slug === CATALOG)?.id;
  if (!typeId) throw new Error(`catalog_types.${CATALOG} not found`);
  const partTypeId = universalType.rows[0].id;
  const brandMap = new Map(brands.rows.map((b) => [b.name, b.id]));

  // 2) categories
  const catId = {};
  for (const [vSlug, v] of Object.entries(VEHICLES)) {
    const vId = await upsertCategory(null, typeId, vSlug, v.title);
    catId[vSlug] = vId;
    for (const gSlug of v.groups) {
      const g = GROUPS[gSlug];
      const gId = await upsertCategory(vId, typeId, gSlug, g.title);
      catId[`${vSlug}/${gSlug}`] = gId;
      for (const [tSlug, tTitle] of g.types) {
        catId[`${vSlug}/${gSlug}/${tSlug}`] = await upsertCategory(gId, typeId, tSlug, tTitle);
      }
    }
  }
  console.log(`[categories] tree ready (${Object.keys(catId).length} nodes)`);

  // 3) parts
  let inserted = 0, updated = 0, skipped = 0;
  for (const part of PARTS) {
    const categoryId = catId[part.path];
    if (!categoryId) { console.log(`  [SKIP] no category for ${part.path}`); skipped++; continue; }
    const brandId = brandMap.get(part.brand);
    if (!brandId) { console.log(`  [SKIP] no brand for ${part.brand} (${part.name})`); skipped++; continue; }

    const { rows: existing } = await pool.query(
      'SELECT id FROM parts WHERE name = $1 AND catalog_category_id = $2 AND part_type_id = $3 LIMIT 1',
      [part.name, categoryId, partTypeId]
    );
    let partId = existing[0]?.id;
    if (!partId) {
      const { rows } = await pool.query(
        `INSERT INTO parts (name, part_number, category, category_label, price, description,
          in_stock, part_type_id, catalog_category_id, brand_id, oem_number)
         VALUES ($1, $2, 'accessory', 'اکسسوری', $3, $4, true, $5, $6, $7, $8)
         RETURNING id`,
        [
          part.name,
          `ACC-${part.path.replaceAll('/', '-').toUpperCase()}-${part.oem}`,
          0,
          `${part.name} — اکسسوری و تزئینات خودرو`,
          partTypeId,
          categoryId,
          brandId,
          part.oem,
        ]
      );
      partId = rows[0].id;
      inserted++;
    } else {
      updated++;
    }

    const { rows: models } = await pool.query('SELECT id FROM vehicle_models WHERE brand_id = $1 LIMIT 3', [brandId]);
    for (const model of models) {
      await pool.query(
        `INSERT INTO part_compatible_models (part_id, brand_id, model_id, year_from, year_to)
         VALUES ($1, $2, $3, 1395, 1405)
         ON CONFLICT DO NOTHING`,
        [partId, brandId, model.id]
      );
    }
  }
  console.log(`[parts] inserted=${inserted} updated=${updated} skipped=${skipped}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
