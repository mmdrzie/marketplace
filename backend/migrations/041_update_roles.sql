-- 041_update_roles.sql
-- Update role descriptions and add store role

BEGIN;

UPDATE roles SET description = 'نمایشگاه', updated_at = NOW() WHERE name = 'agency';

INSERT INTO roles (name, description, is_system) VALUES ('store', 'فروشگاه', true)
ON CONFLICT (name) DO NOTHING;

COMMIT;
