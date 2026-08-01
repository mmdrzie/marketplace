// seed-attributes.mjs
// Seed category-aware attribute definitions (no brand/model/year/mileage - those are direct columns)

import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 5,
});

const COMMON_COLORS = ["سفید", "مشکی", "نقره‌ای", "خاکستری", "آبی", "قرمز", "سبز", "زرد", "نارنجی", "بنفش", "طلایی", "سایر"];

const PASSENGER_BODY_CONDITION = ["نو", "کم کارکرد", "بدون رنگ", "یک لکه رنگ", "دو لکه رنگ", "چند لکه رنگ", "لپی رنگ", "دور رنگ", "درب تعویض", "گلگیر تعویض", "کاپوت تعویض", "صافکاری بدون رنگ", "کامل رنگ", "تصادفی"];

const COMMERCIAL_BODY_CONDITION = ["بدون رنگ", "یک لکه رنگ", "دو لکه رنگ", "چند لکه رنگ", "لپی رنگ", "لپی تعویض", "سینی جلو رنگ", "سینی جلو تعویض", "قیچی رنگ", "دور رنگ", "صافکاری بدون رنگ", "گلگیر رنگ", "کاپوت تعویض", "گلگیر تعویض", "کامل رنگ", "درب تعویض", "یک درب رنگ", "کاپوت رنگ", "دو درب رنگ", "تصادفی", "اتاق تعویض", "سوخته", "اوراقی", "با سابقه تعمیر", "بدون سابقه تعمیر"];

// Define attributes per category group
const ATTR_GEARBOX = { name: 'gearbox', label: 'گیربکس', type: 'select', options: ['اتوماتیک', 'دنده‌ای'] };
const ATTR_FUEL_PASSENGER = { name: 'fuel_type', label: 'نوع سوخت', type: 'select', options: ['بنزین', 'گازوئیل', 'دوگانه سوز', 'برقی', 'هیبرید'] };
const ATTR_FUEL_COMMERCIAL = { name: 'fuel_type', label: 'نوع سوخت', type: 'select', options: ['گازوئیل', 'گاز', 'دوگانه'] };
const ATTR_FUEL_MOTORCYCLE = { name: 'fuel_type', label: 'نوع سوخت', type: 'select', options: ['بنزین', 'برقی'] };
const ATTR_COLOR = { name: 'color', label: 'رنگ بدنه', type: 'select', options: COMMON_COLORS };
const ATTR_BODY_PASSENGER = { name: 'body_condition', label: 'وضعیت بدنه', type: 'select', options: PASSENGER_BODY_CONDITION };
const ATTR_BODY_COMMERCIAL = { name: 'body_condition', label: 'وضعیت بدنه', type: 'select', options: COMMERCIAL_BODY_CONDITION };
const ATTR_CYLINDERS = { name: 'cylinders', label: 'تعداد سیلندر', type: 'select', options: ['4', '5', '6', '8', '10', '12'] };
const ATTR_DRIVETRAIN = { name: 'drivetrain', label: 'دیفرانسیل', type: 'select', options: ['تک دیفرانسیل', 'دو دیفرانسیل'] };
const ATTR_SPECIAL_CASE = { name: 'special_case', label: 'موارد خاص', type: 'select', options: ['مصرف شخصی', 'وارداتی', 'بدون پلاک'] };
const ATTR_ENGINE_CC = { name: 'engine_cc', label: 'حجم موتور', type: 'select', options: ['۱۲۵', '۲۰۰', '۲۵۰', '۳۰۰', '۴۰۰', '۵۰۰', '۶۰۰', '۷۰۰', '۸۰۰', '۱۰۰۰', '۱۲۰۰', '۱۳۰۰', 'بیشتر'] };
const ATTR_COOLING = { name: 'cooling', label: 'سیستم خنک‌کننده', type: 'select', options: ['آب خنک', 'باد خنک'] };
const ATTR_STARTER = { name: 'starter', label: 'استارت', type: 'select', options: ['الکتریکی', 'دستی'] };
const ATTR_PASSENGER_CAPACITY = { name: 'passenger_capacity', label: 'ظرفیت مسافر', type: 'number' };
const ATTR_HOURS_USED = { name: 'hours_used', label: 'ساعت کارکرد', type: 'number' };
const ATTR_WEIGHT = { name: 'weight', label: 'وزن (تن)', type: 'number' };

// Map category slugs to their attribute arrays
const CATEGORY_ATTRS = {
  // Passenger vehicles: gearbox, fuel_type, color, body_condition, cylinders, drivetrain, special_case
  'sedan': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],
  'suv': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],
  'hatchback': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],
  'coupe': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],
  'convertible': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],
  'crossover': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],
  'off-road': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],
  'pickup': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],
  'classic': [ATTR_GEARBOX, ATTR_FUEL_PASSENGER, ATTR_COLOR, ATTR_BODY_PASSENGER, ATTR_CYLINDERS, ATTR_DRIVETRAIN, ATTR_SPECIAL_CASE],

  // Motorcycles: engine_cc, cooling, starter, fuel_type, color
  'motorcycles': [ATTR_ENGINE_CC, ATTR_COOLING, ATTR_STARTER, ATTR_FUEL_MOTORCYCLE, ATTR_COLOR],
  'cruiser': [ATTR_ENGINE_CC, ATTR_COOLING, ATTR_STARTER, ATTR_FUEL_MOTORCYCLE, ATTR_COLOR],
  'street': [ATTR_ENGINE_CC, ATTR_COOLING, ATTR_STARTER, ATTR_FUEL_MOTORCYCLE, ATTR_COLOR],
  'scooter': [ATTR_ENGINE_CC, ATTR_COOLING, ATTR_STARTER, ATTR_FUEL_MOTORCYCLE, ATTR_COLOR],

  // Trucks: gearbox, fuel_type, color, body_condition (commercial)
  'truck': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL],
  'kamyvn-tk-mhvr': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL],
  'kamyvn-dv-mhvr': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL],
  'kamyvn-chhar-mhvr': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL],

  // Bus/Van: gearbox, fuel_type, color, body_condition (commercial), passenger_capacity
  'bus-van': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL, ATTR_PASSENGER_CAPACITY],
  'bus': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL, ATTR_PASSENGER_CAPACITY],
  'minibus': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL, ATTR_PASSENGER_CAPACITY],
  'van': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL, ATTR_PASSENGER_CAPACITY],

  // Light truck: gearbox, fuel_type, color, body_condition (commercial)
  'light-truck': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL],

  // Tractor head: gearbox, fuel_type, color, body_condition (commercial)
  'tractor-head': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL],
  'kshndh-tk-mhvr': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL],
  'kshndh-dv-mhvr': [ATTR_GEARBOX, ATTR_FUEL_COMMERCIAL, ATTR_COLOR, ATTR_BODY_COMMERCIAL],

  // Trailer: color, body_condition (commercial)
  'trailer': [ATTR_COLOR, ATTR_BODY_COMMERCIAL],
  'trylr-dv-mhvr': [ATTR_COLOR, ATTR_BODY_COMMERCIAL],
  'trylr-sh-mhvr': [ATTR_COLOR, ATTR_BODY_COMMERCIAL],
  'trylr-kmrshkn-bvzhy': [ATTR_COLOR, ATTR_BODY_COMMERCIAL],

  // Construction machinery: hours_used, weight
  'construction-machinery': [ATTR_HOURS_USED, ATTR_WEIGHT],
  'lvdr-chrkhy': [ATTR_HOURS_USED, ATTR_WEIGHT],
  'lvdr-znjyry': [ATTR_HOURS_USED, ATTR_WEIGHT],
  'lvdr-bkhv': [ATTR_HOURS_USED, ATTR_WEIGHT],
  'byl-mkanyky-chrkhy': [ATTR_HOURS_USED, ATTR_WEIGHT],
  'byl-mkanyky-znjyry': [ATTR_HOURS_USED, ATTR_WEIGHT],
  'tractor': [ATTR_HOURS_USED, ATTR_WEIGHT],

  // Industrial machinery: minimal attributes
  'industrial-machinery': [ATTR_HOURS_USED, ATTR_WEIGHT],
  'agricultural-machinery': [ATTR_HOURS_USED, ATTR_WEIGHT],
};

async function main() {
  console.log('Seeding attributes per category...');

  // Clear existing attributes and recreate index for clean seed
  await pool.query('DELETE FROM attributes');
  await pool.query(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_attributes_category_name ON attributes(category_id, name)'
  );

  let count = 0;

  for (const [slug, attrs] of Object.entries(CATEGORY_ATTRS)) {
    const cat = await pool.query('SELECT id FROM categories WHERE slug = $1', [slug]);
    if (!cat.rows.length) {
      console.warn('  SKIP: category not found - ' + slug);
      continue;
    }
    const categoryId = cat.rows[0].id;

    // Batch insert all attributes for this category using multi-row VALUES
    const placeholders = attrs.map((_, i) => {
      const base = i * 6;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}::jsonb, true, $${base + 6})`;
    }).join(', ');
    const params = attrs.flatMap((attr, i) => [
      categoryId, attr.name, attr.label, attr.type,
      JSON.stringify(attr.options || []), i + 1
    ]);
    await pool.query(
      `INSERT INTO attributes (category_id, name, label, type, options, is_filterable, sort_order) VALUES ${placeholders}`,
      params
    );
    count += attrs.length;
  }

  console.log('Done. Inserted ' + count + ' attribute definitions across ' + Object.keys(CATEGORY_ATTRS).length + ' categories.');
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
