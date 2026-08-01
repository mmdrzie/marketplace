import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false },
  max: 3,
});

async function main() {
  // Load brands for mapping
  const { rows: brands } = await pool.query(
    "SELECT id, name, slug FROM brands WHERE deleted_at IS NULL AND is_active = true ORDER BY name"
  );
  const brandMap = {};
  for (const b of brands) brandMap[b.name] = b;

  // Load parts categories (slugs -> ids)
  const { rows: cats } = await pool.query("SELECT id, slug FROM parts_categories");
  const catMap = {};
  for (const c of cats) catMap[c.slug] = c.id;

  // Car engine parts
  const carParts = [
    { name: 'واشر سرسیلندر', slug: 'car-engine', brand: 'اپل', price: 450000, oem: '11010-00QAB' },
    { name: 'رینگ پیستون', slug: 'car-engine', brand: 'اپل', price: 280000, oem: '12033-00QAA' },
    { name: 'میل‌لنگ', slug: 'car-engine', brand: 'اپل', price: 4500000, oem: '13011-00QAA' },
    { name: 'سوپاپ هوا', slug: 'car-engine', brand: 'اپل', price: 85000, oem: '14011-00QAA' },
    { name: 'زنجیر تایم', slug: 'car-engine', brand: 'اپل', price: 350000, oem: '15011-00QAA' },
    { name: 'پمپ روغن', slug: 'car-engine', brand: 'اپل', price: 520000, oem: '16011-00QAA' },
    { name: 'پمپ آب', slug: 'car-cooling', brand: 'اپل', price: 380000, oem: '17011-00QAA' },
    { name: 'ترموستات', slug: 'car-cooling', brand: 'اپل', price: 95000, oem: '18011-00QAA' },
    { name: 'رادیاتور', slug: 'car-cooling', brand: 'اپل', price: 1850000, oem: '19011-00QAA' },
    { name: 'کلاچ', slug: 'car-transmission', brand: 'اپل', price: 1200000, oem: '20011-00QAA' },
    { name: 'دیسک و صفحه', slug: 'car-transmission', brand: 'اپل', price: 2500000, oem: '21011-00QAA' },
    { name: 'دنده جلو', slug: 'car-transmission', brand: 'اپل', price: 1800000, oem: '22011-00QAA' },
    { name: 'لنت ترمز جلو', slug: 'car-brake', brand: 'اپل', price: 450000, oem: '23011-00QAA' },
    { name: 'لنت ترمز عقب', slug: 'car-brake', brand: 'اپل', price: 420000, oem: '23012-00QAA' },
    { name: 'دیسک ترمز جلو', slug: 'car-brake', brand: 'اپل', price: 850000, oem: '24011-00QAA' },
    { name: 'کاسه ترمز عقب', slug: 'car-brake', brand: 'اپل', price: 350000, oem: '25011-00QAA' },
    { name: 'سپر جلو', slug: 'car-body', brand: 'اپل', price: 1200000, oem: '26011-00QAA' },
    { name: 'چراغ جلو', slug: 'car-body', brand: 'اپل', price: 650000, oem: '27011-00QAA' },
    { name: 'آینه بغل', slug: 'car-body', brand: 'اپل', price: 320000, oem: '28011-00QAA' },
    { name: 'دستگیره در', slug: 'car-body', brand: 'اپل', price: 120000, oem: '29011-00QAA' },
    { name: 'فیلتر روغن', slug: 'car-fluids', brand: 'اپل', price: 95000, oem: '30011-00QAA' },
    { name: 'فیلتر هوا', slug: 'car-fluids', brand: 'اپل', price: 120000, oem: '31011-00QAA' },
    { name: 'روغن موتور ۱۰W۴۰', slug: 'car-fluids', brand: 'اپل', price: 520000, oem: '32011-00QAA' },
    { name: 'ضد یخ', slug: 'car-fluids', brand: 'اپل', price: 180000, oem: '33011-00QAA' },
    { name: 'طبلک فرمان', slug: 'car-steering', brand: 'اپل', price: 950000, oem: '34011-00QAA' },
    { name: 'سیبک فرمان', slug: 'car-steering', brand: 'اپل', price: 180000, oem: '35011-00QAA' },
    { name: 'کمپرسور کولر', slug: 'car-ac', brand: 'اپل', price: 2800000, oem: '36011-00QAA' },
    { name: 'لاستیک ۱۹۵/۶۵R۱۵', slug: 'car-tires', brand: 'اپل', price: 2500000, oem: '37011-00QAA' },
    { name: 'لاستیک ۲۰۵/۵۵R۱۶', slug: 'car-tires', brand: 'اپل', price: 3200000, oem: '37012-00QAA' },
    { name: 'کمک فنر جلو', slug: 'car-suspension', brand: 'اپل', price: 650000, oem: '38011-00QAA' },
    { name: 'طبق جلو', slug: 'car-suspension', brand: 'اپل', price: 420000, oem: '39011-00QAA' },
    { name: 'باتری ۶۰ آمپر', slug: 'car-electrical', brand: 'اپل', price: 1850000, oem: '40011-00QAA' },
    { name: 'دینام', slug: 'car-electrical', brand: 'اپل', price: 2200000, oem: '41011-00QAA' },
    { name: 'استارت', slug: 'car-electrical', brand: 'اپل', price: 1800000, oem: '42011-00QAA' },
    { name: 'شمع', slug: 'car-electrical', brand: 'اپل', price: 85000, oem: '43011-00QAA' },
  ];

  // Truck parts
  const truckParts = [
    { name: 'لنت ترمز کامیون', slug: 'truck-brake', brand: 'بنز', price: 4500000, oem: 'TB-001' },
    { name: 'فیلتر گازوئیل', slug: 'truck-fuel', brand: 'بنز', price: 850000, oem: 'DF-001' },
    { name: 'پمپ انژکتور', slug: 'truck-fuel', brand: 'بنز', price: 45000000, oem: 'IP-001' },
    { name: 'اینژکتور', slug: 'truck-fuel', brand: 'بنز', price: 3500000, oem: 'IN-001' },
    { name: 'کمپرسور باد', slug: 'truck-brake', brand: 'بنز', price: 8500000, oem: 'AC-001' },
    { name: 'تایر ۳۱۵/۸۰R۲۲.۵', slug: 'truck-tires', brand: 'بنز', price: 8500000, oem: 'TR-315' },
    { name: 'کمک فنر کامیون', slug: 'truck-suspension', brand: 'بنز', price: 2800000, oem: 'SH-001' },
    { name: 'بادامک ترمز', slug: 'truck-brake', brand: 'بنز', price: 1200000, oem: 'BC-001' },
    { name: 'دنده کاهنده', slug: 'truck-transmission', brand: 'بنز', price: 25000000, oem: 'GR-001' },
    { name: 'فیلتر هوا کامیون', slug: 'truck-fluids', brand: 'بنز', price: 450000, oem: 'AF-100' },
  ];

  // Motorcycle parts
  const mcParts = [
    { name: 'زنجیر موتور ۴۲۸', slug: 'motorcycle-engine', brand: 'هوندا', price: 450000, oem: 'MC-CH-428' },
    { name: 'زنجیر موتور ۵۲۰', slug: 'motorcycle-engine', brand: 'هوندا', price: 650000, oem: 'MC-CH-520' },
    { name: 'لنت ترمز موتور', slug: 'motorcycle-brake', brand: 'هوندا', price: 180000, oem: 'MC-BP' },
    { name: 'لاستیک موتور ۱۱۰', slug: 'motorcycle-tires', brand: 'هوندا', price: 450000, oem: 'MC-TR-110' },
    { name: 'لاستیک موتور ۱۵۰', slug: 'motorcycle-tires', brand: 'هوندا', price: 550000, oem: 'MC-TR-150' },
    { name: 'باتری موتورسیکلت', slug: 'motorcycle-electrical', brand: 'هوندا', price: 320000, oem: 'MC-BT' },
    { name: 'فیلتر روغن موتور', slug: 'motorcycle-fluids', brand: 'هوندا', price: 65000, oem: 'MC-OF' },
    { name: 'شمع موتورسیکلت', slug: 'motorcycle-electrical', brand: 'هوندا', price: 45000, oem: 'MC-SP' },
  ];

  const allParts = [...carParts, ...truckParts, ...mcParts];
  let inserted = 0;

  for (const part of allParts) {
    const catId = catMap[part.slug];
    const brand = brandMap[part.brand];
    if (!catId) { console.log(`  [SKIP] no category for ${part.slug}`); continue; }

    const { rows } = await pool.query(`
      INSERT INTO parts (name, part_number, category, category_label, price,
        description, in_stock, parts_category_id, brand_id, oem_number)
      VALUES ($1, $2, 'aftermarket', 'تأمینی', $3, $4, true, $5, $6, $7)
      ON CONFLICT DO NOTHING RETURNING id
    `, [part.name, `${part.slug.toUpperCase()}-${part.oem}`, part.price,
        `${part.name} اصلی و با کیفیت`, catId, brand?.id || null, part.oem
    ]);

    if (rows[0]) {
      inserted++;
      // Add compatibility with the brand's models
      if (brand) {
        const { rows: models } = await pool.query(
          "SELECT id FROM vehicle_models WHERE brand_id = $1 LIMIT 3",
          [brand.id]
        );
        for (const model of models) {
          await pool.query(`
            INSERT INTO part_compatible_models (part_id, brand_id, model_id, year_from, year_to)
            VALUES ($1, $2, $3, 1390, 1405)
            ON CONFLICT DO NOTHING
          `, [rows[0].id, brand.id, model.id]);
        }
      }
    }
  }

  console.log(`[DONE] Inserted ${inserted} parts with compatibility data`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
