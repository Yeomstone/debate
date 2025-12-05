-- 관리자 계정 생성 (비밀번호: Admin123!)
-- BCrypt 해시 값으로 직접 입력
INSERT INTO admins (admin_id, password, name, role, status, created_at, updated_at) 
VALUES ('admin', '$2a$10$dDJ3SW6W3A0OJq1EQ0p4IewDEn7SBkKZPVHfYMl4aZnWZdGKdqlRC', '관리자', 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW());
