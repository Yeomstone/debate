# DebateUserFrontEnd 배포 스크립트 (PowerShell)
# 사용법: .\deploy-frontend.ps1

$SSH_KEY = "private_info\AWS\debate2025.pem"
$SERVER = "ubuntu@13.209.254.24"
$FRONTEND_DIR = "DebateUser\DebateUserFrontEnd"
$DIST_DIR = "dist"
$REMOTE_PATH = "/opt/debate/frontend"

Write-Host "=== DebateUserFrontEnd 배포 시작 ===" -ForegroundColor Green

# .env.production 파일 확인
$envFile = Join-Path $FRONTEND_DIR ".env.production"
if (-not (Test-Path $envFile)) {
    Write-Host "경고: .env.production 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "기본값(/api)을 사용합니다. 프로덕션 환경에서는 .env.production 파일을 생성하는 것을 권장합니다." -ForegroundColor Yellow
}

# 1. 의존성 설치 (필요시)
Write-Host "`n[1/4] 의존성 확인 중..." -ForegroundColor Yellow
Set-Location $FRONTEND_DIR
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules가 없습니다. 의존성 설치 중..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "의존성 설치 실패!" -ForegroundColor Red
        exit 1
    }
}

# 2. 프로덕션 빌드
Write-Host "`n[2/4] 프로덕션 빌드 중..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "빌드 실패!" -ForegroundColor Red
    exit 1
}

# dist 디렉토리 확인
$distPath = Join-Path (Get-Location) $DIST_DIR
if (-not (Test-Path $distPath)) {
    Write-Host "dist 디렉토리를 찾을 수 없습니다: $distPath" -ForegroundColor Red
    exit 1
}

Write-Host "빌드 완료: $distPath" -ForegroundColor Green

# 3. 서버에 업로드
Write-Host "`n[3/4] 서버에 파일 업로드 중..." -ForegroundColor Yellow
# 기존 파일 삭제 후 새 파일 업로드
ssh -i $SSH_KEY $SERVER "rm -rf ${REMOTE_PATH}/*"
scp -i $SSH_KEY -r "${distPath}\*" "${SERVER}:${REMOTE_PATH}/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "업로드 실패!" -ForegroundColor Red
    exit 1
}
Write-Host "업로드 완료" -ForegroundColor Green

# 4. Nginx 재시작 (선택사항)
Write-Host "`n[4/4] Nginx 재시작 중..." -ForegroundColor Yellow
ssh -i $SSH_KEY $SERVER "sudo systemctl reload nginx"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nginx 재시작 실패!" -ForegroundColor Red
    exit 1
}
Write-Host "Nginx 재시작 완료" -ForegroundColor Green

Write-Host "`n=== 배포 완료 ===" -ForegroundColor Green
Set-Location ..\..

