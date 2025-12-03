# DebateUserBackEnd 배포 스크립트 (PowerShell)
# 사용법: .\deploy-backend.ps1

$SSH_KEY = "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$BACKEND_DIR = "DebateUser\DebateUserBackEnd"
$JAR_FILE = "build\libs\debate-user-1.0.0.jar"
$REMOTE_PATH = "/opt/debate/backend"

Write-Host "=== DebateUserBackEnd 배포 시작 ===" -ForegroundColor Green

# 1. 빌드
Write-Host "`n[1/4] 프로젝트 빌드 중..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR
.\gradlew.bat clean build -x test
if ($LASTEXITCODE -ne 0) {
    Write-Host "빌드 실패!" -ForegroundColor Red
    exit 1
}

# JAR 파일 확인
$jarPath = Join-Path (Get-Location) $JAR_FILE
if (-not (Test-Path $jarPath)) {
    Write-Host "JAR 파일을 찾을 수 없습니다: $jarPath" -ForegroundColor Red
    exit 1
}

Write-Host "빌드 완료: $jarPath" -ForegroundColor Green

# 2. 서버에 업로드
Write-Host "`n[2/4] 서버에 파일 업로드 중..." -ForegroundColor Yellow
scp -i $SSH_KEY $jarPath "${SERVER}:${REMOTE_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "업로드 실패!" -ForegroundColor Red
    exit 1
}
Write-Host "업로드 완료" -ForegroundColor Green

# 3. 서버에서 서비스 재시작
Write-Host "`n[3/4] 서버에서 서비스 재시작 중..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "sudo systemctl restart debate-backend"
if ($LASTEXITCODE -ne 0) {
    Write-Host "서비스 재시작 실패!" -ForegroundColor Red
    exit 1
}
Write-Host "서비스 재시작 완료" -ForegroundColor Green

# 4. 서비스 상태 확인
Write-Host "`n[4/4] 서비스 상태 확인 중..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
ssh -i $SSH_KEY $SERVER "sudo systemctl status debate-backend --no-pager"

Write-Host "`n=== 배포 완료 ===" -ForegroundColor Green
Set-Location ..\..

