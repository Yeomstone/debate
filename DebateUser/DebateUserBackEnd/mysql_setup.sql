-- MySQL 데이터베이스 및 사용자 생성 스크립트
-- 토론 플랫폼 프로젝트용

-- 1. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS debate_db 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- 2. 사용자 생성 (비밀번호: Qwer12#$)
CREATE USER IF NOT EXISTS 'debate_web'@'localhost' IDENTIFIED BY 'Qwer12#$';

-- 3. 사용자에게 데이터베이스 권한 부여
GRANT ALL PRIVILEGES ON debate_db.* TO 'debate_web'@'localhost';

-- 4. 원격 접속을 허용하려면 (선택사항)
-- CREATE USER IF NOT EXISTS 'debate_web'@'%' IDENTIFIED BY 'Qwer12#$';
-- GRANT ALL PRIVILEGES ON debate_db.* TO 'debate_web'@'%';

-- 5. 권한 적용
FLUSH PRIVILEGES;

-- 6. 생성 확인
SHOW DATABASES LIKE 'debate_db';
SELECT User, Host FROM mysql.user WHERE User = 'debate_web';

