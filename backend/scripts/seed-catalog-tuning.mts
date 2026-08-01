// seed-catalog-tuning.mts
// Idempotent seed for the Generic Catalog Domain (tuning catalog).
// - Lookups: part_types / catalog_types (upsert)
// - catalog_categories: 3-level tree (vehicle → group → part type)
//   NOTE: path/depth are derived by DB triggers — never written here.
// - Parts: ~50 tuning parts in `parts` (single aggregate) + part_specs + compatibility
import 'dotenv/config';
import pg from 'pg';
import { config } from '../src/config/index.js';

const pool = new pg.Pool({ connectionString: config.database.url, ssl: { rejectUnauthorized: false }, max: 5 });

const TUNING = 'tuning';

// ---------------------------------------------------------------------------
// Category tree: vehicle (depth 0) → group (depth 1) → part type (depth 2)
// ---------------------------------------------------------------------------
const GROUPS = {
  engine: {
    title: 'موتور',
    types: [
      ['piston', 'پیستون'], ['connecting-rod', 'شاتون'], ['crankshaft', 'میل‌لنگ'],
      ['camshaft', 'میل سوپاپ'], ['piston-rings', 'رینگ پیستون'],
      ['timing-kit', 'تسمه و زنجیر تایمینگ'], ['head-gasket', 'واشر سرسیلندر'],
    ],
  },
  'engine-dressing': {
    title: 'دورچین موتور',
    types: [
      ['intake-kit', 'کیت مکش'], ['headers', 'هدرز'], ['lightweight-pulley', 'پولی سبک'],
      ['engine-cover', 'کاور موتور'], ['cold-air-intake', 'بادگیر مکش'],
    ],
  },
  suspension: {
    title: 'زیربندی و تعلیق',
    types: [
      ['sport-shock', 'کمک‌فنر اسپرت'], ['sport-spring', 'فنر اسپرت'],
      ['poly-bushing', 'بوش پلی‌اورتان'], ['sway-bar', 'میل موجگیر'],
    ],
  },
  exhaust: {
    title: 'اگزوز',
    types: [
      ['sport-exhaust', 'اگزوز اسپرت'], ['exhaust-tube', 'تیوب اگزوز'],
      ['exhaust-manifold', 'منیفولد اگزوز'], ['sport-catalyst', 'کاتالیزور اسپرت'],
    ],
  },
  brakes: {
    title: 'ترمز',
    types: [
      ['sport-disc', 'دیسک اسپرت'], ['sport-pad', 'لنت اسپرت'],
      ['caliper', 'کالیپر'], ['steel-brake-line', 'شلنگ ترمز فولادی'],
    ],
  },
  ecu: {
    title: 'ECU و برق',
    types: [['chip-tuning', 'چیپ تیونینگ'], ['ecu-remap', 'ریمپ ECU'], ['ecu-flash', 'فلش ECU']],
  },
  drivetrain: {
    title: 'گیربکس و کلاچ',
    types: [
      ['sport-clutch-kit', 'کیت کلاچ اسپرت'], ['lsd-differential', 'دیفرانسیل LSD'],
      ['lightweight-flywheel', 'فلایویل سبک'],
    ],
  },
  body: {
    title: 'بدنه و آیرودینامیک',
    types: [['body-kit', 'کیت بدنه'], ['spoiler', 'اسپویلر'], ['side-skirt', 'رکاب']],
  },
};

const VEHICLES = {
  car: { title: 'خودرو', groups: ['engine', 'engine-dressing', 'suspension', 'exhaust', 'brakes', 'ecu', 'drivetrain', 'body'] },
  motorcycle: { title: 'موتورسیکلت', groups: ['engine', 'engine-dressing', 'suspension', 'exhaust', 'brakes', 'drivetrain'] },
};

// ---------------------------------------------------------------------------
// Tuning parts: name, category path (vehicle/group/type), brand, oem, stage, gains
// ---------------------------------------------------------------------------
const P = (name, path, brand, oem, opts = {}) => ({ name, path, brand, oem, ...opts });

const PARTS = [
  // ---- car: engine
  P('پیستون فورجینگ اسپرت', 'car/engine/piston', 'اپل', 'PFG-001', { stage: 'Stage 2', hp: [8, 12], tq: [10, 14] }),
  P('شاتون تقویت‌شده', 'car/engine/connecting-rod', 'اپل', 'CR-001', { stage: 'Stage 2' }),
  P('میل‌لنگ اسپرت', 'car/engine/crankshaft', 'اپل', 'CRK-001', { stage: 'Stage 3', hp: [12, 18], tq: [15, 22] }),
  P('میل سوپاپ اسپرت', 'car/engine/camshaft', 'پژو', 'CAM-001', { stage: 'Stage 1', hp: [6, 10], tq: [8, 12] }),
  P('رینگ پیستون اسپرت', 'car/engine/piston-rings', 'اپل', 'PR-001'),
  P('کیت زنجیر تایمینگ اسپرت', 'car/engine/timing-kit', 'پژو', 'TK-001'),
  P('واشر سرسیلندر تقویت‌شده', 'car/engine/head-gasket', 'اپل', 'HG-001', { professional: true }),
  // ---- car: engine dressing
  P('کیت مکش اسپرت (Cold Air Intake)', 'car/engine-dressing/intake-kit', 'اپل', 'CAI-001', { hp: [5, 8], tq: [6, 9] }),
  P('هدرز 4-2-1', 'car/engine-dressing/headers', 'پژو', 'HDR-421', { hp: [7, 10], tq: [9, 12], professional: true }),
  P('پولی سبک آلومینیومی', 'car/engine-dressing/lightweight-pulley', 'اپل', 'LP-001', { hp: [2, 4] }),
  P('کاور موتور کربن', 'car/engine-dressing/engine-cover', 'اپل', 'EC-001'),
  P('بادگیر مکش اسپرت', 'car/engine-dressing/cold-air-intake', 'اپل', 'SRI-001', { hp: [3, 5] }),
  // ---- car: suspension
  P('کمک‌فنر اسپرت قابل تنظیم', 'car/suspension/sport-shock', 'تویوتا', 'SS-001'),
  P('فنر اسپرت کوتاه‌شده', 'car/suspension/sport-spring', 'تویوتا', 'SPS-001'),
  P('بوش پلی‌اورتان طبق', 'car/suspension/poly-bushing', 'اپل', 'PB-001'),
  P('میل موجگیر اسپرت', 'car/suspension/sway-bar', 'تویوتا', 'SWB-001', { professional: true }),
  // ---- car: exhaust
  P('اگزوز اسپرت کامل', 'car/exhaust/sport-exhaust', 'پژو', 'SEX-001', { hp: [4, 6], tq: [5, 8] }),
  P('تیوب اگزوز استیل', 'car/exhaust/exhaust-tube', 'اپل', 'ET-001'),
  P('منیفولد اگزوز اسپرت', 'car/exhaust/exhaust-manifold', 'هیوندای', 'EM-001', { hp: [5, 8] }),
  P('کاتالیزور اسپرت', 'car/exhaust/sport-catalyst', 'هیوندای', 'SC-001'),
  // ---- car: brakes
  P('دیسک ترمز اسپرت سوراخ‌دار', 'car/brakes/sport-disc', 'تویوتا', 'SD-001'),
  P('لنت ترمز سرامیکی', 'car/brakes/sport-pad', 'اپل', 'SP-001'),
  P('کالیپر ۴ پیستونه', 'car/brakes/caliper', 'تویوتا', 'CAL-001', { professional: true }),
  P('شلنگ ترمز فولادی', 'car/brakes/steel-brake-line', 'اپل', 'SBL-001'),
  // ---- car: ecu
  P('چیپ تیونینگ', 'car/ecu/chip-tuning', 'پژو', 'CHIP-001', { hp: [12, 18], tq: [15, 20], ecu: true }),
  P('ریمپ ECU', 'car/ecu/ecu-remap', 'پژو', 'REMAP-001', { hp: [10, 15], tq: [12, 18], ecu: true, stage: 'Stage 1' }),
  P('فلش ECU مسابقه‌ای', 'car/ecu/ecu-flash', 'پژو', 'FLASH-001', { hp: [20, 30], tq: [25, 35], ecu: true, stage: 'Stage 3', professional: true }),
  // ---- car: drivetrain
  P('کیت کلاچ اسپرت', 'car/drivetrain/sport-clutch-kit', 'اپل', 'SCK-001', { professional: true }),
  P('دیفرانسیل LSD', 'car/drivetrain/lsd-differential', 'تویوتا', 'LSD-001', { professional: true }),
  P('فلایویل سبک', 'car/drivetrain/lightweight-flywheel', 'پژو', 'LFW-001', { hp: [3, 5] }),
  // ---- car: body
  P('کیت بدنه اسپرت', 'car/body/body-kit', 'اپل', 'BK-001'),
  P('اسپویلر عقب کربن', 'car/body/spoiler', 'اپل', 'SPL-001'),
  P('رکاب جانبی', 'car/body/side-skirt', 'اپل', 'SK-001'),
  // ---- truck
  P('پیستون تقویت‌شده کامیون', 'truck/engine/piston', 'بنز', 'TP-001', { stage: 'Stage 2' }),
  P('کمک‌فنر بادی اسپرت کامیون', 'truck/suspension/sport-shock', 'بنز', 'TSS-001'),
  P('اگزوز اسپرت کامیون', 'truck/exhaust/sport-exhaust', 'بنز', 'TEX-001', { hp: [10, 15], tq: [20, 30] }),
  P('دیسک ترمز اسپرت کامیون', 'truck/brakes/sport-disc', 'بنز', 'TSD-001'),
  P('لنت ترمز اسپرت کامیون', 'truck/brakes/sport-pad', 'بنز', 'TSP-001'),
  P('ریمپ ECU کامیون', 'truck/ecu/ecu-remap', 'بنز', 'TREM-001', { hp: [25, 40], tq: [40, 60], ecu: true, stage: 'Stage 1' }),
  P('کیت کلاچ تقویتی کامیون', 'truck/drivetrain/sport-clutch-kit', 'بنز', 'TCK-001', { professional: true }),
  // ---- motorcycle
  P('پیستون اسپرت موتورسیکلت', 'motorcycle/engine/piston', 'هوندا', 'MP-001', { hp: [3, 5] }),
  P('میل سوپاپ اسپرت موتور', 'motorcycle/engine/camshaft', 'هوندا', 'MCAM-001', { hp: [2, 4] }),
  P('کیت مکش اسپرت موتور', 'motorcycle/engine-dressing/intake-kit', 'هوندا', 'MCAI-001', { hp: [1, 3] }),
  P('کمک‌فنر اسپرت موتور', 'motorcycle/suspension/sport-shock', 'هوندا', 'MSS-001'),
  P('اگزوز اسپرت موتور', 'motorcycle/exhaust/sport-exhaust', 'هوندا', 'MEX-001', { hp: [2, 4] }),
  P('دیسک اسپرت موتور', 'motorcycle/brakes/sport-disc', 'هوندا', 'MSD-001'),
  P('کیت کلاچ اسپرت موتور', 'motorcycle/drivetrain/sport-clutch-kit', 'هوندا', 'MCK-001'),
];

async function upsertCategory(parentId, catalogTypeId, slug, title, icon = '') {
  const { rows } = await pool.query(
    `SELECT id FROM catalog_categories
     WHERE catalog_type_id = $1 AND slug = $2
       AND ($3::bigint IS NULL AND parent_id IS NULL OR parent_id = $3)
       AND deleted_at IS NULL LIMIT 1`,
    [catalogTypeId, slug, parentId]
  );
  if (rows[0]) {
    await pool.query(
      `UPDATE catalog_categories SET title = $1, updated_at = NOW() WHERE id = $2`,
      [title, rows[0].id]
    );
    return rows[0].id;
  }
  const { rows: ins } = await pool.query(
    `INSERT INTO catalog_categories (catalog_type_id, parent_id, slug, title, icon)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [catalogTypeId, parentId, slug, title, icon]
  );
  return ins[0].id;
}

async function main() {
  const [catalogTypes, brands, performanceType] = await Promise.all([
    pool.query('SELECT id, slug FROM catalog_types'),
    pool.query("SELECT id, name FROM brands WHERE deleted_at IS NULL"),
    pool.query("SELECT id FROM part_types WHERE slug = 'performance'"),
  ]);
  const typeId = catalogTypes.rows.find((r) => r.slug === TUNING)?.id;
  if (!typeId) throw new Error(`catalog_types.${TUNING} not found`);
  const partTypeId = performanceType.rows[0].id;
  const brandMap = new Map(brands.rows.map((b) => [b.name, b.id]));

  // ---- categories ---------------------------------------------------------
  const catId = {}; // 'car/engine/piston' -> id
  for (const [vSlug, v] of Object.entries(VEHICLES)) {
    const vId = await upsertCategory(null, typeId, vSlug, v.title, `vehicle-${vSlug}`);
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

  // ---- parts --------------------------------------------------------------
  let inserted = 0, updated = 0, skipped = 0;
  for (const part of PARTS) {
    const categoryId = catId[part.path];
    if (!categoryId) { console.log(`  [SKIP] no category for ${part.path}`); skipped++; continue; }
    const brandId = brandMap.get(part.brand);
    if (!brandId) { console.log(`  [SKIP] no brand for ${part.brand} (${part.name})`); skipped++; continue; }

    const specs = {
      schema_version: 1,
      stage_label: part.stage ?? 'Stage 1',
      horsepower_gain: part.hp ? { min: part.hp[0], max: part.hp[1] } : undefined,
      torque_gain: part.tq ? { min: part.tq[0], max: part.tq[1] } : undefined,
      performance_metrics: part.ecu ? { boost: '1.2 bar' } : {},
      dyno_charts: [],
      ecu_required: part.ecu ?? false,
      professional_install: part.professional ?? false,
      notes: '',
    };
    if (specs.horsepower_gain === undefined) delete specs.horsepower_gain;
    if (specs.torque_gain === undefined) delete specs.torque_gain;

    const { rows: existing } = await pool.query(
      'SELECT id FROM parts WHERE name = $1 AND catalog_category_id = $2 AND part_type_id = $3 LIMIT 1',
      [part.name, categoryId, partTypeId]
    );
    let partId = existing[0]?.id;
    if (!partId) {
      const { rows } = await pool.query(
        `INSERT INTO parts (name, part_number, category, category_label, price, description,
          in_stock, part_type_id, catalog_category_id, brand_id, oem_number)
         VALUES ($1, $2, 'performance', 'تیونینگ', $3, $4, true, $5, $6, $7, $8)
         RETURNING id`,
        [
          part.name,
          `TUN-${part.path.replaceAll('/', '-').toUpperCase()}-${part.oem}`,
          0,
          `${part.name} مخصوص تیونینگ و ارتقای عملکرد`,
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

    // specs upsert
    await pool.query(
      `INSERT INTO part_specs (part_id, catalog_type_id, specs)
       VALUES ($1, $2, $3)
       ON CONFLICT (part_id, catalog_type_id)
       DO UPDATE SET specs = EXCLUDED.specs, updated_at = NOW()`,
      [partId, typeId, JSON.stringify(specs)]
    );

    // compatibility: up to 3 models of the brand
    const { rows: models } = await pool.query(
      'SELECT id FROM vehicle_models WHERE brand_id = $1 LIMIT 3',
      [brandId]
    );
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
