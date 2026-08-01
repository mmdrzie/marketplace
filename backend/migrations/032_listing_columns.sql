-- 032_listing_columns.sql
-- Add year, mileage, and vehicle_model_id as direct columns on listings
-- Remove these from EAV (listing_attributes) for query performance

BEGIN;

ALTER TABLE listings ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS mileage INTEGER;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS vehicle_model_id BIGINT NOT NULL
  REFERENCES vehicle_models(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_listings_year ON listings(year);
CREATE INDEX IF NOT EXISTS idx_listings_mileage ON listings(mileage);
CREATE INDEX IF NOT EXISTS idx_listings_vehicle_model ON listings(vehicle_model_id);
CREATE INDEX IF NOT EXISTS idx_listings_model_year ON listings(vehicle_model_id, year);
CREATE INDEX IF NOT EXISTS idx_listings_model_price ON listings(vehicle_model_id, price);

COMMIT;
