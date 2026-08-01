-- 043_seed_dev_users.sql
-- Additional demo users for all roles (development/testing)

BEGIN;

INSERT INTO users (id, email, password_hash, name, phone, role, status, email_verified_at, phone_verified_at)
SELECT gen_random_uuid(), 'dealer@marketplace.com', '$2a$12$KxFU/zx.7mUM/8sATW1EbOl1YxRM5GzdkucmSlUGBzWzAvm/MKU1C', 'نماینده نمونه', '09120000001', 'dealer', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'dealer@marketplace.com');

INSERT INTO users (id, email, password_hash, name, phone, role, status, email_verified_at, phone_verified_at)
SELECT gen_random_uuid(), 'agency@marketplace.com', '$2a$12$7YDKex62kZe9wpLKgqUcauHssQKj7CSeCZ/3Hnu01ikhjaedj5BRi', 'آژانس نمونه', '09120000002', 'agency', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'agency@marketplace.com');

INSERT INTO users (id, email, password_hash, name, phone, role, status, email_verified_at, phone_verified_at)
SELECT gen_random_uuid(), 'store@marketplace.com', '$2a$12$WRxx/G81qcWLtmZH5jj76evCJj77cE0CoUinibaSpMiCGbIlQpCX.', 'فروشگاه نمونه', '09120000003', 'store', 'active', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'store@marketplace.com');

COMMIT;
