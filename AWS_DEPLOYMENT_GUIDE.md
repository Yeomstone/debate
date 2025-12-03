# AWS 배포 가이드 - DebateUser 프로젝트

이 문서는 DebateUserBackEnd와 DebateUserFrontEnd를 AWS EC2 서버에 배포하는 상세한 가이드입니다.

## 📋 목차

1. [사전 준비사항](#사전-준비사항)
2. [백엔드 배포 (DebateUserBackEnd)](#백엔드-배포-debateuserbackend)
3. [프론트엔드 배포 (DebateUserFrontEnd)](#프론트엔드-배포-debateuserfrontend)
4. [Nginx 설정](#nginx-설정)
5. [데이터베이스 설정](#데이터베이스-설정)
6. [환경 변수 설정](#환경-변수-설정)
7. [서비스 관리](#서비스-관리)
8. [문제 해결](#문제-해결)

---

## 사전 준비사항

### 1. AWS 서버 정보

- **서버 IP**: 13.209.254.24
- **OS**: Ubuntu
- **사용자**: ubuntu
- **SSH 키**: debate2025.pem

### 2. 서버에 설치해야 할 소프트웨어

#### 방법 1: 자동 설치 스크립트 사용 (권장)

프로젝트 루트의 `server-setup.sh` 스크립트를 사용하면 모든 소프트웨어를 자동으로 설치합니다:

```powershell
# 스크립트를 서버에 업로드
scp -i private_info\AWS\debate2025.pem server-setup.sh ubuntu@13.209.254.24:/tmp/

# 서버에 접속하여 실행
ssh -i private_info\AWS\debate2025.pem ubuntu@13.209.254.24
chmod +x /tmp/server-setup.sh
/tmp/server-setup.sh
```

#### 방법 2: 수동 설치

SSH로 서버에 접속한 후 다음을 설치합니다:

```bash
# Java 17 설치
sudo apt update
sudo apt install openjdk-17-jdk -y

# Node.js 18+ 및 npm 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Nginx 설치
sudo apt install nginx -y

# MySQL 클라이언트 설치 (선택사항)
sudo apt install mysql-client -y

# Git 설치 (코드 배포용)
sudo apt install git -y

# Gradle 설치 (또는 Gradle Wrapper 사용)
sudo apt install gradle -y
```

### 3. 서버 디렉토리 구조 생성

```bash
# 프로젝트 디렉토리 생성
sudo mkdir -p opt/debate
sudo chown ubuntu:ubuntu opt/debate

# 애플리케이션 디렉토리 생성
mkdir -p opt/debate/{backend,frontend,logs,files}
```

---

## 백엔드 배포 (DebateUserBackEnd)

> 💡 **빠른 배포**: 프로젝트 루트의 `deploy-backend.ps1` 스크립트를 사용하면 자동으로 빌드, 업로드, 재시작까지 수행합니다.
>
> ```powershell
> .\deploy-backend.ps1
> ```

### 1. 로컬에서 빌드하기

#### Windows 환경에서 빌드:

```powershell
# DebateUserBackEnd 디렉토리로 이동
cd DebateUser\DebateUserBackEnd

# Gradle Wrapper로 빌드 (실행 가능한 JAR 파일 생성)
.\gradlew.bat clean build -x test

# 빌드된 JAR 파일 확인
# 위치: build\libs\debate-user-1.0.0.jar
```

#### 빌드 결과물:

- **파일 위치**: `DebateUser/DebateUserBackEnd/build/libs/debate-user-1.0.0.jar`
- **파일명**: `debate-user-1.0.0.jar` (또는 `debate-user-1.0.0-plain.jar`가 아닌 실행 가능한 JAR)

> ⚠️ **주의**: `-plain.jar`가 아닌 실행 가능한 JAR 파일을 사용해야 합니다.

### 2. 서버에 파일 업로드

#### 방법 1: SCP 사용 (Windows PowerShell)

```powershell
# JAR 파일 업로드
scp -i private_info\AWS\debate2025.pem `
    DebateUser\DebateUserBackEnd\build\libs\debate-user-1.0.0.jar `
    ubuntu@13.209.254.24:opt/debate/backend/

# application-prod.yml 업로드 (필요시)
scp -i private_info\AWS\debate2025.pem `
    DebateUser\DebateUserBackEnd\src\main\resources\application-prod.yml `
    ubuntu@13.209.254.24:opt/debate/backend/
```

#### 방법 2: Git을 통한 배포

```bash
# 서버에서
cd opt/debate/backend
git clone [your-repository-url] .
# 또는 git pull로 최신 코드 가져오기

# 서버에서 빌드
./gradlew clean build -x test
```

### 3. 서버에서 애플리케이션 설정

SSH로 서버에 접속:

```bash
ssh -i private_info/AWS/debate2025.pem ubuntu@13.209.254.24
```

#### 3.1 환경 변수 설정 파일 생성

```bash
cd opt/debate/backend

# 환경 변수 파일 생성
sudo nano .env
```

`.env` 파일 내용:

```bash
# 데이터베이스 설정
DB_URL=jdbc:mysql://localhost:3306/debate_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true
DB_USERNAME=debate_web
DB_PASSWORD=your_production_password

# JWT 설정
JWT_SECRET=your-production-jwt-secret-key-change-this-to-random-string
JWT_EXPIRATION=86400000

# 서버 포트 (기본값: 9001)
SERVER_PORT=9001

# 파일 업로드 경로
FILE_UPLOAD_DIR=opt/debate/files/editor/images
```

#### 3.2 application-prod.yml 수정

```bash
sudo nano opt/debate/backend/application-prod.yml
```

수정된 내용:

```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

logging:
  level:
    root: INFO
    com.debate: INFO

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: never
  info:
    env:
      enabled: false

file:
  upload-dir: ${FILE_UPLOAD_DIR}
  upload-url-prefix: /files/editor/images

jwt:
  secret: ${JWT_SECRET}
  expiration: ${JWT_EXPIRATION}

server:
  port: ${SERVER_PORT}
```

### 4. Systemd 서비스 생성

백엔드를 시스템 서비스로 등록하여 자동 시작되도록 설정:

```bash
sudo nano /etc/systemd/system/debate-backend.service
```

서비스 파일 내용:

```ini
[Unit]
Description=Debate User Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=opt/debate/backend
EnvironmentFile=opt/debate/backend/.env
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod -Dspring.config.additional-location=file:opt/debate/backend/application-prod.yml opt/debate/backend/debate-user-1.0.0.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=debate-backend

[Install]
WantedBy=multi-user.target
```

서비스 활성화 및 시작:

```bash
# systemd 재로드
sudo systemctl daemon-reload

# 서비스 활성화 (부팅 시 자동 시작)
sudo systemctl enable debate-backend

# 서비스 시작
sudo systemctl start debate-backend

# 서비스 상태 확인
sudo systemctl status debate-backend

# 로그 확인
sudo journalctl -u debate-backend -f
```

---

## 프론트엔드 배포 (DebateUserFrontEnd)

> 💡 **빠른 배포**: 프로젝트 루트의 `deploy-frontend.ps1` 스크립트를 사용하면 자동으로 빌드, 업로드, Nginx 재시작까지 수행합니다.
>
> ```powershell
> .\deploy-frontend.ps1
> ```

### 1. 로컬에서 빌드하기

#### Windows 환경에서 빌드:

```powershell
# DebateUserFrontEnd 디렉토리로 이동
cd DebateUser\DebateUserFrontEnd

# 의존성 설치 (처음 한 번만)
npm install
# 또는
yarn install

# 프로덕션 빌드
npm run build
# 또는
yarn build
```

#### 빌드 결과물:

- **디렉토리**: `DebateUser/DebateUserFrontEnd/dist/`
- 이 디렉토리의 모든 파일을 서버에 업로드해야 합니다.

### 2. 환경 변수 설정

프로덕션 빌드 전에 API URL을 설정해야 합니다.

#### 방법 1: .env.production 파일 생성 (권장)

```powershell
# DebateUserFrontEnd 디렉토리에 .env.production 파일 생성
cd DebateUser\DebateUserFrontEnd
```

`.env.production` 파일 내용:

```env
# Nginx를 통해 프록시하는 경우 (권장)
# 상대 경로를 사용하면 도메인/IP 변경 시 재빌드 불필요
VITE_API_BASE_URL=/api

# 또는 직접 백엔드 서버를 지정하는 경우
# VITE_API_BASE_URL=http://13.209.254.24:9001/api
```

> ⚠️ **주의**:
>
> - Vite는 환경 변수에 `VITE_` 접두사가 있어야 클라이언트 번들에 포함됩니다.
> - Nginx를 통해 프록시하는 경우 `/api` (상대 경로)를 사용하는 것이 좋습니다.
> - 직접 백엔드 서버를 지정하는 경우 CORS 설정이 필요할 수 있습니다.

빌드:

```powershell
npm run build
```

#### 방법 2: 배포 스크립트 사용 (자동화)

프로젝트 루트에 있는 `deploy-frontend.ps1` 스크립트를 사용하면 자동으로 빌드하고 배포합니다.

#### 방법 2: 빌드 후 설정 파일 수정

빌드 후 `dist` 폴더의 JavaScript 파일에서 API URL을 직접 수정할 수도 있지만, 권장하지 않습니다.

### 3. 서버에 파일 업로드

#### 방법 1: SCP 사용

```powershell
# dist 폴더 전체 업로드
scp -i private_info\AWS\debate2025.pem `
    -r DebateUser\DebateUserFrontEnd\dist\* `
    ubuntu@13.209.254.24:opt/debate/frontend/
```

#### 방법 2: Git을 통한 배포

```bash
# 서버에서
cd opt/debate/frontend
git clone [your-repository-url] .
# 또는 git pull로 최신 코드 가져오기

# 의존성 설치 및 빌드
npm install
npm run build

# 빌드된 파일을 웹 서버 디렉토리로 복사
sudo cp -r dist/* /var/www/debate/
```

---

## Nginx 설정

Nginx를 리버스 프록시로 사용하여 프론트엔드와 백엔드를 연결합니다.

### 1. Nginx 설정 파일 생성

```bash
sudo nano /etc/nginx/sites-available/debate
```

설정 내용:

```nginx
# 프론트엔드 서버 (포트 80)
server {
    listen 80;
    server_name 13.209.254.24;  # 또는 도메인 이름

    # 프론트엔드 정적 파일 서빙
    root opt/debate/frontend;
    index index.html;

    # 프론트엔드 라우팅 (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 요청을 백엔드로 프록시
    location /api {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 파일 업로드 경로 프록시
    location /files {
        proxy_pass http://localhost:9001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Nginx 설정 활성화

```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/debate /etc/nginx/sites-enabled/

# 기본 설정 제거 (선택사항)
sudo rm /etc/nginx/sites-enabled/default

# Nginx 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 상태 확인
sudo systemctl status nginx
```

### 3. 방화벽 설정

```bash
# UFW 방화벽 설정
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (SSL 인증서 사용 시)
sudo ufw allow 9001/tcp  # 백엔드 직접 접근 (선택사항, 보안상 비권장)

# 방화벽 활성화
sudo ufw enable

# 방화벽 상태 확인
sudo ufw status
```

---

## 데이터베이스 설정

### 1. MySQL 설치 및 설정

```bash
# MySQL 설치
sudo apt update
sudo apt install mysql-server -y

# MySQL 보안 설정
sudo mysql_secure_installation

# MySQL 접속
sudo mysql -u root -p
```

### 2. 데이터베이스 및 사용자 생성

MySQL에서 실행:

```sql
-- 데이터베이스 생성
CREATE DATABASE debate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 사용자 생성 및 권한 부여
CREATE USER 'debate_web'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON debate_db.* TO 'debate_web'@'localhost';
FLUSH PRIVILEGES;

-- 확인
SHOW DATABASES;
SELECT user, host FROM mysql.user;
```

### 3. 데이터베이스 스키마 및 초기 데이터

로컬에서 SQL 파일을 서버로 업로드:

```powershell
# SQL 파일 업로드
scp -i private_info\AWS\debate2025.pem `
    DebateUser\DebateUserBackEnd\mysql_setup.sql `
    ubuntu@13.209.254.24:/tmp/

scp -i private_info\AWS\debate2025.pem `
    insert_categories.sql `
    ubuntu@13.209.254.24:/tmp/
```

서버에서 실행:

```bash
# 데이터베이스 스키마 적용
mysql -u debate_web -p debate_db < /tmp/mysql_setup.sql

# 초기 데이터 삽입
mysql -u debate_web -p debate_db < /tmp/insert_categories.sql
```

---

## 환경 변수 설정

### 백엔드 환경 변수 확인

```bash
# .env 파일 확인
cat opt/debate/backend/.env

# 환경 변수 테스트
cd opt/debate/backend
source .env
echo $DB_URL
```

### 프론트엔드 환경 변수

프론트엔드는 빌드 시점에 환경 변수가 번들에 포함되므로, 배포 후에는 변경할 수 없습니다.
API URL을 변경하려면 다시 빌드해야 합니다.

---

## 서비스 관리

### 백엔드 서비스 관리

```bash
# 서비스 시작
sudo systemctl start debate-backend

# 서비스 중지
sudo systemctl stop debate-backend

# 서비스 재시작
sudo systemctl restart debate-backend

# 서비스 상태 확인
sudo systemctl status debate-backend

# 로그 확인
sudo journalctl -u debate-backend -f
sudo journalctl -u debate-backend --since "1 hour ago"

# 서비스 비활성화 (부팅 시 자동 시작 안 함)
sudo systemctl disable debate-backend
```

### Nginx 관리

```bash
# Nginx 시작
sudo systemctl start nginx

# Nginx 중지
sudo systemctl stop nginx

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 로그 확인
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### MySQL 관리

```bash
# MySQL 시작
sudo systemctl start mysql

# MySQL 중지
sudo systemctl stop mysql

# MySQL 재시작
sudo systemctl restart mysql

# MySQL 상태 확인
sudo systemctl status mysql
```

---

## 문제 해결

### 1. 백엔드가 시작되지 않는 경우

```bash
# 서비스 로그 확인
sudo journalctl -u debate-backend -n 50

# JAR 파일 실행 테스트
cd opt/debate/backend
java -jar -Dspring.profiles.active=prod debate-user-1.0.0.jar

# 포트 사용 확인
sudo netstat -tlnp | grep 9001
sudo lsof -i :9001
```

### 2. 프론트엔드가 표시되지 않는 경우

```bash
# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log

# 파일 권한 확인
ls -la opt/debate/frontend

# Nginx 설정 테스트
sudo nginx -t
```

### 3. API 연결 오류

```bash
# 백엔드 서비스 상태 확인
sudo systemctl status debate-backend

# 백엔드 로그 확인
sudo journalctl -u debate-backend -f

# 네트워크 연결 테스트
curl http://localhost:9001/api/health
curl http://localhost:9001/actuator/health

# Nginx 프록시 테스트
curl http://localhost/api/health
```

### 4. 데이터베이스 연결 오류

```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 접속 테스트
mysql -u debate_web -p debate_db

# 데이터베이스 연결 정보 확인
cat opt/debate/backend/.env | grep DB_
```

### 5. 파일 업로드 오류

```bash
# 파일 업로드 디렉토리 확인
ls -la opt/debate/files/editor/images

# 디렉토리 권한 설정
sudo chown -R ubuntu:ubuntu opt/debate/files
sudo chmod -R 755 opt/debate/files
```

---

## 배포 체크리스트

배포 전 확인사항:

- [ ] Java 17 설치 확인
- [ ] Node.js 18+ 설치 확인
- [ ] MySQL 설치 및 데이터베이스 생성
- [ ] 백엔드 JAR 파일 빌드 및 업로드
- [ ] 프론트엔드 빌드 및 업로드
- [ ] 환경 변수 파일(.env) 설정
- [ ] application-prod.yml 설정
- [ ] Systemd 서비스 등록 및 시작
- [ ] Nginx 설정 및 재시작
- [ ] 방화벽 포트 오픈
- [ ] 백엔드 서비스 상태 확인
- [ ] 프론트엔드 접속 테스트
- [ ] API 연결 테스트
- [ ] 파일 업로드 테스트

---

## 추가 보안 설정 (권장)

### 1. SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급 (도메인이 있는 경우)
sudo certbot --nginx -d your-domain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### 2. 백엔드 포트 직접 접근 차단

방화벽에서 9001 포트를 외부에 노출하지 않고, Nginx를 통해서만 접근하도록 설정합니다.

### 3. 환경 변수 파일 권한 설정

```bash
# .env 파일 권한 제한
sudo chmod 600 opt/debate/backend/.env
sudo chown ubuntu:ubuntu opt/debate/backend/.env
```

---

## 업데이트 배포 프로세스

### 백엔드 업데이트

```bash
# 1. 로컬에서 새 버전 빌드
cd DebateUser\DebateUserBackEnd
.\gradlew.bat clean build -x test

# 2. 서버에 업로드
scp -i private_info\AWS\debate2025.pem `
    build\libs\debate-user-1.0.0.jar `
    ubuntu@13.209.254.24:opt/debate/backend/

# 3. 서버에서 서비스 재시작
ssh -i private_info\AWS\debate2025.pem ubuntu@13.209.254.24
sudo systemctl restart debate-backend
```

### 프론트엔드 업데이트

```bash
# 1. 로컬에서 새 버전 빌드
cd DebateUser\DebateUserFrontEnd
npm run build

# 2. 서버에 업로드
scp -i private_info\AWS\debate2025.pem `
    -r dist\* `
    ubuntu@13.209.254.24:opt/debate/frontend/

# 3. Nginx 캐시 클리어 (필요시)
ssh -i private_info\AWS\debate2025.pem ubuntu@13.209.254.24
sudo systemctl reload nginx
```

---

## 참고 자료

- [Spring Boot 배포 가이드](https://spring.io/guides/gs/spring-boot-for-azure/)
- [Nginx 설정 가이드](https://nginx.org/en/docs/)
- [Systemd 서비스 관리](https://www.freedesktop.org/software/systemd/man/systemd.service.html)
- [AWS EC2 사용 가이드](https://docs.aws.amazon.com/ec2/)

---

**작성일**: 2025-01-XX  
**작성자**: AI Assistant  
**버전**: 1.0.2