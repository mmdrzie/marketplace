-- 030_authz.sql
-- Phase 1: Authorization System (Role → Permission → UserRole)
-- جانشین نقش رشته‌ای قدیمی (موجود migration 001_auth)

BEGIN;

-- Permissions (تعریف همه دسترسی‌ها)
CREATE TABLE IF NOT EXISTS permissions (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,    -- e.g. listing:create
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'general',  -- listing, user, dealer, admin, vehicle, etc.
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permissions_category ON permissions(category);

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,    -- admin, dealer, agency, user
  description     TEXT,
  is_system       BOOLEAN NOT NULL DEFAULT false,  -- system roles cannot be deleted
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Role ↔ Permission (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
  id              BIGSERIAL PRIMARY KEY,
  role_id         BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id   BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_perms_role ON role_permissions(role_id);

-- User ↔ Role (many-to-many — جایگزین users.role)
CREATE TABLE IF NOT EXISTS user_roles (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id         BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id);

-- Seed default roles and permissions
INSERT INTO roles (name, description, is_system) VALUES
  ('user', 'کاربر عادی', true),
  ('dealer', 'نماینده', true),
  ('agency', 'بنگاه', true),
  ('admin', 'مدیر سیستم', true)
ON CONFLICT (name) DO NOTHING;

-- Core permissions
INSERT INTO permissions (name, description, category) VALUES
  ('listing:create', 'ثبت آگهی جدید', 'listing'),
  ('listing:edit.own', 'ویرایش آگهی خود', 'listing'),
  ('listing:edit.any', 'ویرایش هر آگهی', 'listing'),
  ('listing:delete.own', 'حذف آگهی خود', 'listing'),
  ('listing:delete.any', 'حذف هر آگهی', 'listing'),
  ('listing:approve', 'تایید آگهی', 'listing'),
  ('listing:feature', 'ویژه کردن آگهی', 'listing'),
  ('user:manage', 'مدیریت کاربران', 'user'),
  ('user:ban', 'مسدود کردن کاربر', 'user'),
  ('dealer:manage', 'مدیریت نماینده‌ها', 'dealer'),
  ('dealer:verify', 'تایید نمایندگی', 'dealer'),
  ('vehicle:brand.edit', 'مدیریت برندها', 'vehicle'),
  ('vehicle:model.edit', 'مدیریت مدل‌ها', 'vehicle'),
  ('vehicle:variant.edit', 'مدیریت واریانت‌ها', 'vehicle'),
  ('vehicle:registry.edit', 'مدیریت رجیستری', 'vehicle'),
  ('taxonomy:edit', 'مدیریت دسته‌بندی', 'taxonomy'),
  ('attribute:edit', 'مدیریت ویژگی‌ها', 'attribute'),
  ('settings:edit', 'مدیریت تنظیمات', 'admin'),
  ('analytics:view', 'مشاهده آمار', 'analytics'),
  ('audit:view', 'مشاهده لاگ', 'admin'),
  ('payment:manage', 'مدیریت پرداخت‌ها', 'payment'),
  ('report:manage', 'مدیریت گزارشات', 'report')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to admin role (admin gets everything)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Basic permissions for user role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'user' AND p.name IN ('listing:create', 'listing:edit.own', 'listing:delete.own')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Dealer gets user permissions + more
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'dealer' AND p.name IN (
  'listing:create', 'listing:edit.own', 'listing:delete.own',
  'listing:feature', 'dealer:manage'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Agency gets dealer permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'agency' AND p.name IN (
  'listing:create', 'listing:edit.own', 'listing:delete.own',
  'listing:feature'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;
