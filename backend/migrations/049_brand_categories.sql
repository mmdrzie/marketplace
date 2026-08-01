-- 049_brand_categories.sql
-- Create brand_categories table + vehicle_models.category_id for taxonomy filtering

BEGIN;

CREATE TABLE IF NOT EXISTS brand_categories (
  brand_id    BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (brand_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_categories_category ON brand_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_brand_categories_brand ON brand_categories(brand_id);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_models' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE vehicle_models ADD COLUMN category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_vehicle_models_category_id ON vehicle_models(category_id);
  END IF;
END $$;

COMMIT;
