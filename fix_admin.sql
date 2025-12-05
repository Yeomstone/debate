-- 기존 admin 삭제 후 재생성
DELETE FROM admins WHERE admin_id='admin';

-- 로컬에서 복사한 해시 사용
INSERT INTO admins (admin_id, password, name, role, status, created_at, updated_at) 
VALUES ('admin', '$2a$10$aF9pxUU7.DNxqnWoONdS5eKpTM31E.nuqNqozTD/VE5tJYbwoRV/K', '관리자', 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW());
