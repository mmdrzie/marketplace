-- 019_fix_fleet_dates.sql
-- Convert fleet_vehicles date-like TEXT columns to proper DATE type.
-- Empty strings ('') cannot cast to DATE, so blank values become NULL.

BEGIN;

ALTER TABLE fleet_vehicles
  ALTER COLUMN last_service TYPE DATE
    USING (NULLIF(last_service, '')::DATE);

ALTER TABLE fleet_vehicles
  ALTER COLUMN next_service TYPE DATE
    USING (NULLIF(next_service, '')::DATE);

ALTER TABLE fleet_vehicles
  ALTER COLUMN insurance_expiry TYPE DATE
    USING (NULLIF(insurance_expiry, '')::DATE);

ALTER TABLE fleet_vehicles
  ALTER COLUMN inspection_expiry TYPE DATE
    USING (NULLIF(inspection_expiry, '')::DATE);

ALTER TABLE fleet_vehicles
  ALTER COLUMN purchase_date TYPE DATE
    USING (NULLIF(purchase_date, '')::DATE);

COMMIT;
