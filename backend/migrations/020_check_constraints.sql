-- 020_check_constraints.sql
-- Add CHECK constraints for data integrity.

BEGIN;

ALTER TABLE listings
  ADD CONSTRAINT IF NOT EXISTS chk_listings_price_nonneg
  CHECK (price >= 0);

ALTER TABLE wallet_transactions
  ADD CONSTRAINT IF NOT EXISTS chk_wallet_amount_positive
  CHECK (amount > 0);

ALTER TABLE fleet_vehicles
  ADD CONSTRAINT IF NOT EXISTS chk_fleet_status_valid
  CHECK (status IN ('active', 'maintenance', 'retired'));

COMMIT;
