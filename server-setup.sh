#!/bin/bash
# AWS EC2 서버 초기 설정 스크립트
# 사용법: 서버에 SSH 접속 후 실행
# ssh -i private_info/AWS/debate2025.pem ubuntu@13.209.254.24
# 그 다음 이 스크립트를 업로드하고 실행

set -e  # 에러 발생 시 스크립트 중단

echo "=== Debate 프로젝트 서버 초기 설정 시작 ==="

# 1. 시스템 업데이트
echo "[1/8] 시스템 업데이트 중..."
sudo apt update
sudo apt upgrade -y

# 2. Java 17 설치
echo "[2/8] Java 17 설치 중..."
sudo apt install openjdk-17-jdk -y
java -version

# 3. Node.js 18+ 설치
echo "[3/8] Node.js 18+ 설치 중..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version

# 4. Nginx 설치
echo "[4/8] Nginx 설치 중..."
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# 5. MySQL 설치
echo "[5/8] MySQL 설치 중..."
sudo apt install mysql-server -y
sudo systemctl enable mysql
sudo systemctl start mysql

# 6. Git 설치
echo "[6/8] Git 설치 중..."
sudo apt install git -y

# 7. 디렉토리 구조 생성
echo "[7/8] 디렉토리 구조 생성 중..."
sudo mkdir -p /opt/debate/{backend,frontend,logs,files/editor/images}
sudo chown -R ubuntu:ubuntu /opt/debate
chmod -R 755 /opt/debate

# 8. 방화벽 설정
echo "[8/8] 방화벽 설정 중..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

echo ""
echo "=== 서버 초기 설정 완료 ==="
echo ""
echo "다음 단계:"
echo "1. MySQL 데이터베이스 및 사용자 생성"
echo "2. 백엔드 JAR 파일 업로드"
echo "3. 프론트엔드 빌드 파일 업로드"
echo "4. Systemd 서비스 설정"
echo "5. Nginx 설정"
echo ""
echo "자세한 내용은 AWS_DEPLOYMENT_GUIDE.md를 참조하세요."

