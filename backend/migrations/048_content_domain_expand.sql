-- 048_content_domain_expand.sql
-- Expand articles table into a unified Content Domain
-- Phase 1: Expand schema (no rename, no breaking changes)

BEGIN;

-- ============================================================
-- 1. LOOKUP: content_types (replaces ENUM for flexibility)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_types (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  label       TEXT NOT NULL,
  icon        TEXT,
  color       TEXT,
  sort_order  INT NOT NULL DEFAULT 0
);

INSERT INTO content_types (slug, label, icon, color, sort_order) VALUES
  ('news',          'اخبار',          'newspaper',      '#3B82F6', 1),
  ('guide',         'راهنما',         'book-open',      '#10B981', 2),
  ('how_to',        'آموزش',          'tools',          '#8B5CF6', 3),
  ('maintenance',   'نگهداری',        'wrench',         '#F59E0B', 4),
  ('glossary',      'واژه‌نامه',      'book-type',      '#EC4899', 5),
  ('tech_spec',     'مشخصات فنی',     'cpu',            '#06B6D4', 6),
  ('review',        'بررسی',          'star',           '#F97316', 7),
  ('comparison',    'مقایسه',         'columns',        '#6366F1', 8),
  ('buying_guide',  'راهنمای خرید',   'shopping-cart',  '#14B8A6', 9),
  ('faq',           'پرسش‌های متداول','help-circle',    '#84CC16', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 2. content_categories (hierarchical, parent_id + materialized path)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_categories (
  id          BIGSERIAL PRIMARY KEY,
  parent_id   BIGINT REFERENCES content_categories(id) ON DELETE SET NULL,
  slug        TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  title       TEXT NOT NULL,
  description TEXT,
  icon        TEXT,
  path        TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_categories_parent ON content_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_categories_path ON content_categories(path);
CREATE INDEX IF NOT EXISTS idx_content_categories_slug ON content_categories(slug);

-- ============================================================
-- 3. content_tags + content_tag_map
-- ============================================================
CREATE TABLE IF NOT EXISTS content_tags (
  id    BIGSERIAL PRIMARY KEY,
  slug  TEXT NOT NULL UNIQUE CHECK (slug = LOWER(slug)),
  label TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_tag_map (
  content_id  BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id      BIGINT NOT NULL REFERENCES content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_content_tag_map_tag ON content_tag_map(tag_id);

-- ============================================================
-- 4. content_links (polymorphic: content to any entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_links (
  content_id   BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  entity_type  TEXT NOT NULL CHECK (entity_type IN (
    'BRAND', 'MODEL', 'VARIANT', 'PART', 'CATEGORY', 'LISTING', 'DEALER'
  )),
  entity_id    BIGINT NOT NULL,
  label        TEXT,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_content_links_entity
  ON content_links(entity_type, entity_id);

-- ============================================================
-- 5. content_relations (bidirectional content adjacency)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_relations (
  content_id         BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  related_content_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  relation_type      TEXT NOT NULL DEFAULT 'related',
  sort_order         INT DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_id, related_content_id),
  CHECK (content_id <> related_content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_relations_related
  ON content_relations(related_content_id);

-- ============================================================
-- 6. user_saved_contents (bookmarks)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_saved_contents (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, content_id)
);

CREATE INDEX IF NOT EXISTS idx_user_saved_contents_content
  ON user_saved_contents(content_id);

-- ============================================================
-- 7. EXPAND: articles table (add columns, no renames)
-- ============================================================
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS content_type_id    BIGINT REFERENCES content_types(id),
  ADD COLUMN IF NOT EXISTS category_id        BIGINT REFERENCES content_categories(id),
  ADD COLUMN IF NOT EXISTS author_id          UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS status             TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS meta_title         TEXT,
  ADD COLUMN IF NOT EXISTS meta_description   TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url      TEXT,
  ADD COLUMN IF NOT EXISTS og_image           TEXT,
  ADD COLUMN IF NOT EXISTS robots             TEXT DEFAULT 'index,follow',
  ADD COLUMN IF NOT EXISTS extra_seo          JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS difficulty         TEXT
    CHECK (difficulty IS NULL OR difficulty IN ('beginner', 'intermediate', 'expert')),
  ADD COLUMN IF NOT EXISTS scheduled_at       TIMESTAMPTZ;

-- ============================================================
-- 8. BACKFILL: existing articles → content_type = news
-- ============================================================
UPDATE articles
SET content_type_id = (SELECT id FROM content_types WHERE slug = 'news'),
    status          = COALESCE(status, 'published'),
    robots          = COALESCE(robots, 'index,follow'),
    extra_seo       = COALESCE(extra_seo, '{}')
WHERE content_type_id IS NULL;

-- ============================================================
-- 9. INDEXES for new columns on articles
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_articles_content_type ON articles(content_type_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled ON articles(scheduled_at) WHERE scheduled_at IS NOT NULL;

COMMIT;