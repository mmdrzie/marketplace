BEGIN;

CREATE TABLE IF NOT EXISTS fleet_vehicles (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  type              TEXT NOT NULL DEFAULT '',
  brand             TEXT NOT NULL DEFAULT '',
  model             TEXT NOT NULL DEFAULT '',
  year              INTEGER NOT NULL DEFAULT 0,
  plate_number      TEXT NOT NULL DEFAULT '',
  vin               TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'active',
  location          JSONB NOT NULL DEFAULT '{}',
  fuel_consumption  NUMERIC NOT NULL DEFAULT 0,
  last_service      TEXT NOT NULL DEFAULT '',
  next_service      TEXT NOT NULL DEFAULT '',
  insurance_expiry  TEXT NOT NULL DEFAULT '',
  inspection_expiry TEXT NOT NULL DEFAULT '',
  purchase_date     TEXT NOT NULL DEFAULT '',
  purchase_price    BIGINT NOT NULL DEFAULT 0,
  current_value     BIGINT NOT NULL DEFAULT 0,
  total_hours       INTEGER NOT NULL DEFAULT 0,
  total_mileage     INTEGER NOT NULL DEFAULT 0,
  monthly_fuel_data JSONB NOT NULL DEFAULT '[]',
  service_history   JSONB NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fleet_vehicles_user ON fleet_vehicles(user_id);

COMMIT;
