import pg from 'pg';

const client = new pg.Client({
  connectionString: 'postgresql://postgres.jgxwphavposyclrrxeub:DXgSLath3y0uPlOH@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
});
await client.connect();

const AUTHOR = '219b6895-140e-48fe-a648-5e659522117e'; // محمد

const articles = [
  {
    slug: 'how-car-engine-works',
    title: 'موتور خودرو چگونه کار می‌کند؟',
    type: 'guide',
    category: 'engine_basics',
    difficulty: 'beginner',
    reading_time: 8,
    views: 1240,
    pinned: true,
    excerpt: 'با اصول اولیه عملکرد موتور احتراق داخلی، چرخه چهارزمانه و اجزای اصلی پیشرانه آشنا شوید.',
    body: `<h2>چرخه چهارزمانه چیست؟</h2>
<p>موتورهای احتراق داخلی مدرن بر پایه چرخه چهارزمانه اتو کار می‌کنند: مکش، تراکم، احتراق و تخلیه.</p>
<h2>اجزای اصلی پیشرانه</h2>
<p>پیستون، شاتون، میل‌لنگ، سوپاپ‌ها و شمع از اجزای کلیدی هر موتور هستند.</p>
<h2>سیستم سوخت‌رسانی و احتراق</h2>
<p>پمپ بنزین سوخت را به انژکتور رسانده و واحد کنترل موتور (ECU) زمان پاشش را تنظیم می‌کند.</p>`,
  },
  {
    slug: 'engine-oil-change-guide',
    title: 'تعویض روغن موتور؛ هر آنچه باید بدانید',
    type: 'how_to',
    category: 'fluids_lubricants',
    difficulty: 'beginner',
    reading_time: 6,
    views: 980,
    excerpt: 'مراحل تعویض روغن موتور، انتخاب گرید مناسب و فاصله‌های زمانی استاندارد را یاد بگیرید.',
    body: `<h2>چه زمانی روغن را تعویض کنیم؟</h2>
<p>به‌طور معمول هر ۵۰۰۰ تا ۱۰۰۰۰ کیلومتر بسته به نوع روغن و شرایط رانندگی.</p>
<h2>انتخاب گرید مناسب</h2>
<p>گرید روغن مانند 10W-40 را بر اساس توصیه سازنده انتخاب کنید.</p>
<h2>مراحل تعویض</h2>
<p>خالی کردن روغن داغ، تعویض فیلتر، و پر کردن با مقدار استاندارد.</p>`,
  },
  {
    slug: 'periodic-maintenance-schedule',
    title: 'برنامه سرویس دوره‌ای خودرو',
    type: 'maintenance',
    category: 'maintenance_schedule',
    difficulty: 'beginner',
    reading_time: 7,
    views: 1450,
    pinned: true,
    excerpt: 'جدول کامل سرویس‌های دوره‌ای شامل تعویض روغن، فیلترها، شمع، ترمز و لاستیک بر اساس کارکرد.',
    body: `<h2>سرویس‌های ۵۰۰۰ کیلومتری</h2>
<p>تعویض روغن موتور و بازرسی کلی سطح سیالات.</p>
<h2>سرویس‌های ۲۰۰۰۰ کیلومتری</h2>
<p>تعویض فیلتر هوا، فیلتر کابین و بررسی لنت ترمز.</p>
<h2>سرویس‌های ۶۰۰۰۰ کیلومتری</h2>
<p>تعویض شمع‌ها، بررسی سیستم تعلیق و تنظیم باد لاستیک.</p>`,
  },
  {
    slug: 'tire-selection-guide',
    title: 'راهنمای انتخاب لاستیک مناسب',
    type: 'buying_guide',
    category: 'wheels_tires',
    difficulty: 'intermediate',
    reading_time: 9,
    views: 1100,
    excerpt: 'با کدهای روی لاستیک، شاخص بار و سرعت و تفاوت رینگ‌ها برای انتخاب درست آشنا شوید.',
    body: `<h2>خواندن کد روی لاستیک</h2>
<p>کدی مانند 205/55R16 بیانگر پهنا، پروفیل و قطر رینگ است.</p>
<h2>شاخص بار و سرعت</h2>
<p>حروفی مانند H یا V حداکثر سرعت مجاز لاستیک را مشخص می‌کنند.</p>
<h2>لاستیک فصلی یا چهارفصل؟</h2>
<p>بسته به اقلیم و الگوی رانندگی، انتخاب مناسب را انجام دهید.</p>`,
  },
  {
    slug: 'odbd2-diagnostics-basics',
    title: 'عیب‌یابی با دستگاه دیاگ؛ کدهای خطا را بخوانید',
    type: 'guide',
    category: 'diagnostics',
    difficulty: 'intermediate',
    reading_time: 10,
    views: 860,
    excerpt: 'با نحوه اتصال دستگاه دیاگ، خواندن کدهای OBD-II و تفسیر رایج‌ترین خطاها آشنا شوید.',
    body: `<h2>دستگاه دیاگ چیست؟</h2>
<p>دستگاه دیاگ با اتصال به درگاه OBD-II اطلاعات سنسورها و کدهای خطا را می‌خواند.</p>
<h2>کدهای رایج</h2>
<p>کد P0300 نشانه احتراق ناقص و P0420 نشانه کاهش راندمان کاتالیزور است.</p>
<h2>پاک کردن کد خطا</h2>
<p>پس از رفع مشکل، کد را پاک کنید و مطمئن شوید خطا برنگردد.</p>`,
  },
  {
    slug: 'brake-maintenance-tips',
    title: 'نکات طلایی نگهداری سیستم ترمز',
    type: 'maintenance',
    category: 'brakes_safety',
    difficulty: 'beginner',
    reading_time: 5,
    views: 1330,
    excerpt: 'علائم فرسودگی لنت، زمان تعویض دیسک ترمز و بررسی روغن ترمز را بشناسید.',
    body: `<h2>علائم فرسودگی لنت ترمز</h2>
<p>صدای سوت هنگام ترمز و لرزش پدال از نشانه‌های اصلی فرسودگی است.</p>
<h2>تعویض روغن ترمز</h2>
<p>روغن ترمز باید هر دو سال یک‌بار تعویض شود.</p>`,
  },
  {
    slug: 'car-market-price-trends-summer',
    title: 'تحلیل بازار خودرو؛ روند قیمت‌ها در تابستان',
    type: 'news',
    category: 'market_prices',
    difficulty: null,
    reading_time: 4,
    views: 2100,
    excerpt: 'بررسی نوسانات قیمت خودروهای داخلی و وارداتی در ماه‌های اخیر و پیش‌بینی روند بازار.',
    body: `<h2>بازار خودروهای داخلی</h2>
<p>قیمت خودروهای پرطرفدار داخلی در این ماه با نوسان کمی همراه بوده است.</p>
<h2>خودروهای وارداتی</h2>
<p>عرضه خودروهای وارداتی جدید بازار را متحول کرده است.</p>`,
  },
  {
    slug: 'new-ev-models-launch',
    title: 'خودروهای برقی جدید به بازار ایران رسیدند',
    type: 'news',
    category: 'car_news',
    difficulty: null,
    reading_time: 3,
    views: 3100,
    excerpt: 'نخستین سری خودروهای برقی وارداتی با ایستگاه‌های شارژ شهری رونمایی شد.',
    body: `<h2>مدل‌های جدید</h2>
<p>دو مدل سدان و کراس‌اوور برقی وارد کشور شدند.</p>
<h2>زیرساخت شارژ</h2>
<p>برنامه توسعه ایستگاه‌های شارژ در شهرهای بزرگ آغاز شده است.</p>`,
  },
];

try {
  const typeIds = new Map();
  const catIds = new Map();
  const { rows: types } = await client.query('SELECT id, slug FROM content_types');
  for (const t of types) typeIds.set(t.slug, t.id);
  const { rows: cats } = await client.query('SELECT id, slug FROM content_categories');
  for (const c of cats) catIds.set(c.slug, c.id);

  let inserted = 0;
  for (const a of articles) {
    const { rows: existing } = await client.query('SELECT id FROM articles WHERE slug = $1', [a.slug]);
    if (existing.length) { console.log(`⏭  ${a.slug} (exists)`); continue; }

    await client.query(`
      INSERT INTO articles (
        title, slug, excerpt, body, cover_image, author, tags,
        is_pinned, views, reading_time, published_at, status,
        content_type_id, category_id, author_id, difficulty
      ) VALUES ($1,$2,$3,$4,NULL,$5,$6,$7,$8,$9,$10,'published',$11,$12,$13,$14)
    `, [
      a.title, a.slug, a.excerpt, a.body,
      'محمد', ['{demo}'],
      a.pinned ?? false, a.views, a.reading_time, new Date().toISOString(),
      typeIds.get(a.type), catIds.get(a.category), AUTHOR, a.difficulty,
    ]);
    inserted++;
    console.log(`✅  ${a.slug} (${a.type} → ${a.category})`);
  }
  console.log(`\nInserted ${inserted} articles`);
} finally {
  await client.end();
}
