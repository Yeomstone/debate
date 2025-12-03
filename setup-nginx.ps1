# Debate Nginx 설정 스크립트
# 사용법: .\setup-nginx.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$NGINX_CONF = Join-Path $PSScriptRoot "debate.nginx"
$REMOTE_CONF_PATH = "/tmp/debate"

Write-Host "=== Debate Nginx Setup Start ===" -ForegroundColor Green

# 1. Nginx 설치 확인 및 설치
Write-Host "`n[1/4] Checking Nginx installation..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "if ! command -v nginx &> /dev/null; then sudo apt update && sudo apt install nginx -y; fi"

# 2. 설정 파일 업로드
Write-Host "`n[2/4] Uploading configuration file..." -ForegroundColor Yellow
scp -i $SSH_KEY $NGINX_CONF "${SERVER}:${REMOTE_CONF_PATH}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

# 3. 설정 적용
Write-Host "`n[3/4] Applying configuration..." -ForegroundColor Yellow
$commands = @(
    "sudo mv ${REMOTE_CONF_PATH} /etc/nginx/sites-available/debate",
    "sudo ln -sf /etc/nginx/sites-available/debate /etc/nginx/sites-enabled/",
    "sudo rm -f /etc/nginx/sites-enabled/default",
    "sudo nginx -t",
    "sudo systemctl restart nginx"
)
$commandString = $commands -join "; "

ssh -i $SSH_KEY $SERVER $commandString
if ($LASTEXITCODE -ne 0) {
    Write-Host "Configuration failed! Please check the error message above." -ForegroundColor Red
    exit 1
}

# 4. 상태 확인
Write-Host "`n[4/4] Checking Nginx status..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "sudo systemctl status nginx --no-pager"

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
Write-Host "이제 브라우저에서 http://13.209.254.24 로 접속해보세요!" -ForegroundColor Cyan
