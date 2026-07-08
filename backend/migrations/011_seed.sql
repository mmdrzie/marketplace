-- 011_seed.sql
-- Seed data: categories, provinces, demo admin user

BEGIN;

-- Demo admin (password: admin123456)
INSERT INTO users (id, email, password_hash, name, role, status, email_verified_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@marketplace.com', '$2a$12$pBdqN.GXiUoP/yOnR/6CpubiDzPxAEyl8cApr93wwtl6qiZ0UjL56', 'مدیر سایت', 'admin', 'active', NOW())
ON CONFLICT (email) DO NOTHING;

-- Demo user (password: demo123456) — برای حالت نمایشی لاگین
INSERT INTO users (id, email, password_hash, name, phone, role, status, email_verified_at, phone_verified_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'demo@marketplace.com', '$2a$12$85k7gxy1TMaWQs4VH8TMHuubjWXTPNujwN6JCWgOaYgudfFfrzvnO', 'کاربر آزمایشی', '09120000000', 'user', 'active', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Provinces
INSERT INTO provinces (name, slug, sort_order) VALUES
  ('آذربایجان شرقی', 'azarbaijan-sharghi', 1),
  ('آذربایجان غربی', 'azarbaijan-gharbi', 2),
  ('اردبیل', 'ardabil', 3),
  ('اصفهان', 'isfahan', 4),
  ('البرز', 'alborz', 5),
  ('ایلام', 'ilam', 6),
  ('بوشهر', 'bushehr', 7),
  ('تهران', 'tehran', 8),
  ('چهارمحال و بختیاری', 'chaharmahal-bakhtiari', 9),
  ('خراسان جنوبی', 'khorasan-jonubi', 10),
  ('خراسان رضوی', 'khorasan-razavi', 11),
  ('خراسان شمالی', 'khorasan-shomali', 12),
  ('خوزستان', 'khuzestan', 13),
  ('زنجان', 'zanjan', 14),
  ('سمنان', 'semnan', 15),
  ('سیستان و بلوچستان', 'sistan-baluchestan', 16),
  ('فارس', 'fars', 17),
  ('قزوین', 'qazvin', 18),
  ('قم', 'qom', 19),
  ('کردستان', 'kordestan', 20),
  ('کرمان', 'kerman', 21),
  ('کرمانشاه', 'kermanshah', 22),
  ('کهگیلویه و بویراحمد', 'kohgiluyeh-boyerAhmad', 23),
  ('گلستان', 'golestan', 24),
  ('گیلان', 'gilan', 25),
  ('لرستان', 'lorestan', 26),
  ('مازندران', 'mazandaran', 27),
  ('مرکزی', 'markazi', 28),
  ('هرمزگان', 'hormozgan', 29),
  ('همدان', 'hamedan', 30),
  ('یزد', 'yazd', 31)
ON CONFLICT (slug) DO NOTHING;

-- Cities for Tehran
WITH p AS (SELECT id FROM provinces WHERE slug = 'tehran')
INSERT INTO cities (province_id, name)
SELECT p.id, name FROM p, (VALUES
  ('تهران'), ('ری'), ('شماگشت'), ('دماوند'), ('فیروزکوه'),
  ('ورامین'), ('اسلامشهر'), ('رباط کریم'), ('شهریار'), ('ملارد'),
  ('قدس'), ('قرچک'), ('پردیس'), ('پیشوا'), ('بهارستان')
) AS v(name)
ON CONFLICT DO NOTHING;

-- Cities for Isfahan
WITH p AS (SELECT id FROM provinces WHERE slug = 'isfahan')
INSERT INTO cities (province_id, name)
SELECT p.id, name FROM p, (VALUES
  ('اصفهان'), ('کاشان'), ('خمینی شهر'), ('نجف آباد'), ('شاهین شهر'),
  ('فولادشهر'), ('مبارکه'), ('لنجان')
) AS v(name)
ON CONFLICT DO NOTHING;

-- Cities for Khorasan Razavi
WITH p AS (SELECT id FROM provinces WHERE slug = 'khorasan-razavi')
INSERT INTO cities (province_id, name)
SELECT p.id, name FROM p, (VALUES
  ('مشهد'), ('نیشابور'), ('سبزوار'), ('قوچان'), ('کاشمر'),
  ('تربت حیدریه'), ('تربت جام'), ('چناران')
) AS v(name)
ON CONFLICT DO NOTHING;

-- Top-level categories
INSERT INTO categories (name, name_en, slug, icon, sort_order) VALUES
  ('خودرو', 'Vehicles', 'vehicles', 'car', 1),
  ('ماشین‌آلات راهسازی', 'Construction Machinery', 'construction-machinery', 'excavator', 2),
  ('ماشین‌آلات کشاورزی', 'Agricultural Machinery', 'agricultural-machinery', 'tractor', 3),
  ('ماشین‌آلات صنعتی', 'Industrial Machinery', 'industrial-machinery', 'industry', 4),
  ('موتورسیکلت', 'Motorcycles', 'motorcycles', 'motorcycle', 5),
  ('قطعات و لوازم', 'Parts & Accessories', 'parts', 'gear', 6)
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories for Vehicles
WITH p AS (SELECT id FROM categories WHERE slug = 'vehicles')
INSERT INTO categories (name, name_en, slug, icon, parent_id, sort_order)
SELECT p.id, name, name_en, slug, icon, p.id, sort_order
FROM p, (VALUES
  ('سواری', 'Sedan', 'sedan', 'car', 1),
  ('شاسی بلند', 'SUV', 'suv', 'suv', 2),
  ('وانت', 'Pickup', 'pickup', 'truck', 3),
  ('کامیون', 'Truck', 'truck', 'truck', 4)
) AS v(name, name_en, slug, icon, sort_order)
ON CONFLICT (slug) DO NOTHING;

-- Demo article
INSERT INTO articles (title, slug, excerpt, body, author, category, published_at)
VALUES (
  'راهنمای خرید خودرو دست دوم',
  'used-car-buying-guide',
  'نکات مهم قبل از خرید خودرو کارکرده',
  E'# راهنمای خرید خودرو دست دوم\n\nدر این مقاله به بررسی نکات مهم قبل از خرید خودرو کارکرده می‌پردازیم.\n\n## ۱. بررسی وضعیت بدنه\n\nبدنه خودرو باید از نظر رنگ، صافکاری و زنگ زدگی بررسی شود.\n\n## ۲. بررسی وضعیت فنی\n\nموتور، گیربکس و سیستم تعلیق از مهمترین بخش‌های فنی هستند.',
  'تیم دیسیژن',
  'راهنما',
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
