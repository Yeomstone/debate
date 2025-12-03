# DebateUserBackEnd 서비스 설정 스크립트
# 사용법: .\setup-service.ps1

$SSH_KEY = Join-Path $PSScriptRoot "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$SERVICE_FILE = Join-Path $PSScriptRoot "debate-backend.service"
$REMOTE_SERVICE_PATH = "/tmp/debate-backend.service"

Write-Host "=== Setting up Debate Backend Service ===" -ForegroundColor Green

# 1. 서비스 파일 업로드
Write-Host "`n[1/3] Uploading service file..." -ForegroundColor Yellow
scp -i $SSH_KEY $SERVICE_FILE "${SERVER}:${REMOTE_SERVICE_PATH}"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upload failed!" -ForegroundColor Red
    exit 1
}

# 2. 서비스 등록 및 시작
Write-Host "`n[2/3] Registering and starting service..." -ForegroundColor Yellow
$commands = @(
    "sudo mv ${REMOTE_SERVICE_PATH} /etc/systemd/system/debate-backend.service",
    "sudo systemctl daemon-reload",
    "sudo systemctl enable debate-backend",
    "sudo systemctl restart debate-backend"
)
$commandString = $commands -join "; "

ssh -i $SSH_KEY $SERVER $commandString
if ($LASTEXITCODE -ne 0) {
    Write-Host "Service setup failed!" -ForegroundColor Red
    exit 1
}

# 3. 상태 확인
Write-Host "`n[3/3] Checking service status..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "sudo systemctl status debate-backend --no-pager"

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green
