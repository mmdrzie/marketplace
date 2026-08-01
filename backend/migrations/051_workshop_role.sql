-- 051_workshop_role.sql
-- Add workshop role (تعمیرکار / تیونر) — registration role for workshop owners

BEGIN;

INSERT INTO roles (name, description, is_system) VALUES ('workshop', 'تعمیرکار / تیونر', true)
ON CONFLICT (name) DO NOTHING;

-- Workshop gets the same base listing permissions as a regular user
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'workshop' AND p.name IN ('listing:create', 'listing:edit.own', 'listing:delete.own')
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;
