BEGIN;

CREATE TABLE IF NOT EXISTS service_logs (
  id            BIGSERIAL PRIMARY KEY,
  vehicle_id    BIGINT NOT NULL REFERENCES fleet_vehicles(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT '',
  cost          BIGINT NOT NULL DEFAULT 0,
  description   TEXT NOT NULL DEFAULT '',
  service_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_logs_vehicle ON service_logs(vehicle_id);

COMMIT;
